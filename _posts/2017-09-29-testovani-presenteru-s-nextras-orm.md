---
layout: posts
title: Testování Nette presenterů s Nextras Orm
category: programovani
category_title: Programování
tags: []
comments: true
---
Nedávno jsem se dostal k zajímavé pracovní příležitosti spolupracovat na rozvoji jednoho pracovního portálu jako Team Leader. Kromě rozdávání práce a její kontroly jsem měl za úkol i navrhnout způsoby a implementaci testů. Jednalo se o starší aplikaci napsanou v Zendu 1. Ačkoliv aplikace byla rozdělena v klasickém poměru Model-View-Controler, většina logiky byla v šablonách, pokud se tomu tak dalo vůbec říkat. Plán byl přepsat aplikaci postupně do Nette. Před mým příchodem byl již vybrán i framework pro práci s databází - [Nextras Orm](https://nextras.org/orm). Takže jsem se pustil do jeho studia.

Kromě klasických unit testů jsem v aplikaci chtěl mít i integrační. V mém chápání slova smyslu se jedná o testování fungování komponent společně dohromady. Aby tyto testy byly rychlé, chtěl jsem testovat na úrovni Nette presenterů a nechtěl jsem mít instanci databáze. Nejdřív jsem tomu nevěřil, ale povedlo se a já si užíval radost, o které si při práci na "stoletých" PHP aplikacích můžete nechat jen zdát.

Nextras Orm se vyznačuje třemi základními prvky. Entita. Mapper. Repozitář. Kdo najde krásné české slovo pro Mapper, toho pozvu na hermelín ;). Hodně se zde pracuje s anotacemi, takže pro pozor, komentář už není to co můžete bez obav smazat.

Příklad entity:

```php
<?php

/**
 * @property int       $id        {primary}
 * @property string    $url
 * @property string    $title
 * @property string    $content
 */
class Article extends Nextras\Orm\Entity\Entity
{
}
```

Mapper:

```php
<?php

class ArticlesMapper extends Nextras\Orm\Mapper\Mapper
{
    protected $tableName = 'articles';
}
```

Repozitář:

```php
<?php

/**
 * @method Article|NULL getById($id)
 */
class ArticlesRepository extends Nextras\Orm\Repository\Repository
{
    /**
     * @return string[]
     */
    public static function getEntityClassNames()
    {
        return [Article::class];
    }
}
```
V anotaci je pro přehlednost uvedena metoda, která je poděděná. Ostatní metody z třídy `Repository` je lepší schovat do konkrétních metod v `ArticlesRepository`. Myslím, že tady by se možná více hodilo použít skládání tříd více, než dědičnost.

Pak je tu ještě jedna třída, kterou prozatím můžeme chápat jako agregátor repozitářů, nazveme ji prostě `Orm`.

```php
<?php

/**
 * @property-read ArticlesRepository    $articles
 * @property-read CategoriesRepository  $categories
 */
class Orm extends Nextras\Orm\Model\Model
{
}
```

Pokud jde o podrobnosti, je lepší si přečíst dokumentaci, ale základní struktura je jasná. Do repozitáře píši všechny metody, které mají co dočinění se čtením dat či jejich ukládáním. Mapper pak slouží mimo jiné k psaní složitých dotazů, na které je Orm krátké. Pokud možno je dobré se tomu vyhnout (testování je pak složitější ale o tom až na konci).

Příklad typických metod pro repozitář:

```php
<?php

...

    /**
     * @return Article|NULL
     */
    public function getByUrl($url)
    {
        return $this->getBy(['url' => $url]);
    }

    /**
     * @return Article
     */
    public function add($url, $title, $content)
    {
        $article = new Article();
        $article->url = $url;
        $article->title = $title;
        $article->content = $content;

        return $this->persist($article);
    }
```

Chvilku se pozastavím u `$this->persist`. Kdo již nastudoval dokumentaci ví, že abyste entitu uložili, musíte zavolat také metodu `flush()`. Já se držím konvence volat `flush()` mimo repozitář, kvůli návrhovému vzoru [Work Of Unit](https://www.codeproject.com/Articles/581487/Unit-of-Work-Design-Pattern). Jde o to, že chci změny propsat v jedné transakci a to i nad rozdílnými repozitáři. Hned ukáži jak to myslím:

```php
<?php

class ArticlesServise {

    /** @var Orm */
    private $orm;

    public function __construct(Orm $orm) {
        $this->orm = $orm;
    }

    public function createArticleWithCategory() {
        $this->orm->articles->add('muj-clanek', 'Můj článek', 'Skvělý obsah :)');
        $this->orm->categories->add('nova kategorie');
        $this->orm->flush();
    }
}
```

Myslím, že je na čase konečně napsat i nějaký ten test. Budeme toho potřebovat docela dost a ze všeho nejvíce mapper, který nebude mapovat repozitář na databázi ale na pole. Takový mapper je naštěstí součástí knihovny Nextras Orm. Nebudu totiž používat mock, ale místo reálné databáze použiji paměť, kde budou data persistentní po dobu běhu testu.

Nejdříve je potřeba správně nastavit mapper v configuraci aplikace.

config.test.neon:
```python
extensions:
    orm: Nextras\Orm\Bridges\NetteDI\OrmExtension
orm:
    model: Orm
services:
    orm.mapper: Nextras\Orm\TestHelper\TestMapper
    orm.mappers.articles: Nextras\Orm\TestHelper\TestMapper
    orm.mappers.categories: Nextras\Orm\TestHelper\TestMapper
```

Pro testování jsem zvolil, jak jinak, Nette Tester. 

```php
<?php

use Nette\DI\Container;
use Tester;
use Tester\Assert;
use Nette\Application;
use Nette\Application\Responses\TextResponse;

$container = require __DIR__ . '/../../bootstrap.php';

/**
 * @testCase
 */
class ArticlePresenterTest {
    /** @var Container */
    private $container;

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    public function setUp()
    {
        /** @var Orm $orm */
        $orm = $this->container->getService('orm.model');
        $user = $orm->articles->add('muj-clanek', 'Můj článek', 'Skvělý obsah :)');
        $orm->flush();
    }

    public function testShowDetail()
    {
        $presenterName = 'Front:Articles'
        $params = [
            'action' => 'detail',
            'url' => 'muj-clanek'
        ];

        $dom = $this->runPresenter($presenterName, 'GET', $params, [])

        Assert::equal('Můj článek', (string) $dom->find('h1')[0]);
    }

    /**
     * @return Tester\DomQuery
     */
    private function runPresenter($presenterName, $method, array $params, array $post) {
        $presenterFactory = $this->container->getService('application.presenterFactory');
        $presenter = $presenterFactory->createPresenter($presenterName);
        $presenter->autoCanonicalize = false;
        $request = new Application\Request($presenterName, $method, $params, $post);
        $response = $presenter->run($request);

        Assert::type(\Nette\Bridges\ApplicationLatte\Template::class, $response->getSource());
        $html = (string) $response->getSource();
        $dom = Tester\DomQuery::fromHtml($html);

        return $dom
    }
}
```

A od teď už je testování presenteru s databází snadné :). Část s vytvářením presenteru, requestu a domu jsem pro přehlednost schoval do vlastní metody.

Je tu ještě jedna věc pro čtenáře se nebojí tmy. Pokud jste potřebovali napsat vlastní SQL dotaz, použili jste jistě správně mapper, ale co s tím v testu? Naštěstí mapper použitý pro testy má metodu `addMethod`, ve které můžete definovat medotu a pomocí funkce i chování a výsledek, který má tato metoda mít.
