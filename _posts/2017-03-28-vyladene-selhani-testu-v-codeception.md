---
layout: post
title: Vyladěné selhání testu v Codeception
categories: [Programování]
---
Codeception je skvělý nástroj pro psaní selenium testů. V práci jej používáme čím dál více a zvlášť náš tester si je nemůže vynachválit. Protože já píší pouze malé testy, případně nastřeluji koncept psaní, moc často testy nepouštím a neladím je. Mám vždycky radost, když s nějakou potřebnou vychytávkou přijde právě tester. Ten píše ty velké regresní testy u kterých vždycky narazí na nějaký zádrhel nebo nepříjemnost. A s jednou takovou nepříjemností byl u mě také napsoledy.

Codeception standartně ošetřuje chybný test tak, že kromě červených fontů v konzoli, vygeneruje screenshot obrazovky. Z něho je možné obvykle vyčíst, kde se asi stala chyba. Pokud ovšem potřebuji chybný test speciálně ošetřit, mám možnost použít metodou `_failed`.

```php
<?php

class MojeTestovaciTridaCest {
  public function _failed(WebGuy $I) {
    ...
  }

  public function test(WebGuy $I) {
    ...
  }
}
```

Neštastné je, že screenshot se vygeneruje před zavoláním metody `_failed`. Pokud potřebujete po selhání testu ještě provést nějaké modifikace na stránce, nebo třeba upravit nastavení v zázemí aplikace, screenshot nebude již odpovídat stavu, kdy chyba vznikla. Moje typická situace je - pro některé testy mít speciální nastavení aplikace v zázemí. Poté co test skončí chci mít vše v původním stavu a také poté, když test selže.

```php
<?php

class MojeTestovaciTridaCest {
  public function _before(WebGuy $I) {
    $this->prepare();
  }

  public function _after(WebGuy $I) {
    $this->cleanup();
  }

  public function _failed(WebGuy $I) {
    $this->cleanup();
  }

  public function test(WebGuy $I) {
    ...
  }
}
```

Naštestí si můžeme napsat vlastní `helper`, který situaci vyřeší. Helper je vlastně to samé jako modul, takže máme možnost i rozšiřovat stávající moduly, čehož také využijeme. Můj cíl je mít možnost zavolat metodu, která vygeneruje screenshot s html těsně předtím než začnu cokoliv se stránkou dělat.

```php
public function _failed(WebGuy $I) {
  $I->makeFailedScreenshot();
  $this->cleanup();
}
```

Nový helper bude vypadat nějak takto:

```php
<?php

namespace Codeception\Module;

class FailedScreenshotHelper extends \Codeception\Module {
  private $_test;

  public function _before(\Codeception\TestInterface $test) {
    $this->_test = $test;
  }

  public function makeFailedScreenshot() {
    $webDriver = $this->getModule('WebDriver');
    $webDriver->disableFailedScreenshot();
    $webDriver->_saveScreenshot($report = $this->_getFileName('.png'));
    $this->_test->getMetadata()->addReport('png', $report);
    $webDriver->_savePageSource($report = $this->_getFileName('.html'));
    $this->_test->getMetadata()->addReport('html', $report);
  }

  private function _getFileName($suffix) {
    $filename = preg_replace('~\W~', '.', $this->_test->getSignature());
    $outputDir = codecept_output_dir();
    $this->debug("Screenshot and page source will be saved into '$outputDir' dir");
    return $outputDir . mb_strcut($filename, 0, 249 - count($suffix), 'utf-8') . '.fail' . $suffix;
  }
}
```

Ve vytváření souboru nehledejte žádnou záhadu, je to v podstatě opsané z modulu `WebDriver`, tak aby názvy souborů byl totožné.

Takto nám sice vygenerování screenshotu funguje, ale má to jednu chybku. Modul `WebDriver` stále generuje screeshot před zavoláním `_failed`. A protože jsem již psal, že můžeme existující moduly modifikovat, využijeme toho a podědíme si modul `WebDriver` a upravíme jeho chování tak, že budeme moci určit, zda má screenshot vygenerovat nebo ne.

```php
<?php

namespace Codeception\Module;

class ExtendedWebDriver extends \Codeception\Module\WebDriver {
  private $_enableFailedScreenshot = true;

  public function disableFailedScreenshot() {
    $this->_enableFailedScreenshot = false;
  }

  public function _failed(\Codeception\TestInterface $test, $fail) {
    if ($this->_enableFailedScreenshot) {
      parent::_failed($test, $fail);
    }
  }
}
```

A zároveň upravíme metodu `makeFailedScreenshot`, kde na začátku vypneme původní generování screenshotů:

```php
<?php

class FailedScreenshotHelper extends \Codeception\Module {
  ...

  public function makeFailedScreenshot() {
    $webDriver = $this->getModule('ExtendedWebDriver');
    $webDriver->disableFailedScreenshot();
    ...
  }
}
```

A máme hotovo. Tedy skoro. Aby vše fungovalo, chybí maličkost a to upravit `acceptance.suite.yml`. Místo modulu `WebDriver` použijeme `ExtendedWebDriver`. A přidáme nový helper:

```php
class_name: WebGuy
modules:
  enabled:
    - ExtendedWebDriver
    - FailedScreenshotHelper
...
```

A nakonec přidám ještě malou vychytávku. Časem začne narůstat složka se screenshoty selhaných testů, bylo by hezké, kdyby se smazaly ty, u kterých již testy doběhly v pořádku. Původně jsem tuto funkčnost přidal do stejného modulu, ale poté jsem zjistil, že tento modul již existuje: [Codeception\Extension\RunFailed](http://codeception.com/addons#codeceptionextensionrunfailed)
