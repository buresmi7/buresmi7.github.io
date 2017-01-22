---
layout: posts
title: Rychlý našeptávač českých měst
category: Programování
tags: []
---
Nedávno jsem řešil rychlost našeptávače měst ve formuáři. Jednalo se o projekt v Nette a tenkrát jsem zvolil nejjednodušší variantu: vložit cca 6000 měst do javascriptového pole a při zadání alespoň tří znaků skript prohledával celé pole. Pro lepší seřazení jsem použil přiřazení váhy každému městu které odpovídalo zadání. Tohle celé mělo jednu velkou nevýhodu. Bylo to pomalé. Ne na stolním počítači s dostatkem výkonu ale na slabších noteboocích či slim stanicích byla odezva někdy i více jak 5 sekund.

Zvolil jsem řešení, které přesunulo algoritmus do PHP části aplikace. Dosáhl jsem určitého zrychlení a navíc jsem se zbavil závislosti na výkonu stanice uživatele. Stále to ovšem byly časy hodně nad jednu vteřinu. Než jsem se rozhodl zaneřádit kód keší napadlo mě celou funkcionalitu přesunout ven jako mikroslužbu a s rychlostí experimentovat tam.

Mikroslužbu jsem se rozhodl napsat v Javascriptu a hostovat přes AWS Lambda a AWS Api Gateway. Obě služby jsou hezky propojené a spuštění mikroslužby není těžké. Výhoda Lambdy je, že lze škálovat výkon a tak i tento pomalý algoritmus lze s přidáním více výkonu provozovat s rychlou odezvou. Maximální velikost skriptů je 10 MB a tak se do skriptu bez problému vešel i zmiňovaný seznam měst.

Cíl byl téměř splňen. Našeptávač už byl použitelný a kód byl oddělen aplikace. Už si stačilo jen hrát s algoritmem. Nebudu lhát, nejsem žádný chytrák a algoritmizace není moje silná stránka. Už jsem se smiřoval s dostatečným řešením, když mi kolega poradil rozdělit města do skupin podle začínajících písmen. Princip je založen na tom, že našeptávači stačí prohledávat pouze města, která zadaným řetězcem začínají a že našeptávač začíná našptávat po třetím zadaném písmenu.

Vytvořil jsem tedy asociativní pole (PHP hatmatilka, ve světě Javascriptu se jedná o objekty), kde klíčem jsou první tři písmena a prvkem je pole se seznamem měst která začínají na tyto tři písmena:

```javascript
{
    pra: [
    {
        name: "Prackovice nad Labem",
        parent: "Litoměřice",
        region: "Ústecký kraj",
        ascii: "prackovice nad labem"
    },
    {
        name: "Praha 1",
        parent: "Praha",
        region: "Hlavní město Praha",
        ascii: "praha 1"
    },
    ...
    ]
}
```

Další optimalizace je atribut "ascii", který by se jinak musel generovat při každém vyhledávání. Přínos je ovšem podle mě (zpětně bráno) sporný.

Pro názornost přikládám i graf odezvy:

![Graf odezvy](/assets/posts/2016-01-22-rychly-naseptavac-ceskych-mest/latency.png)

Výsledná rychlost v aplikaci se pohybuje mezi 200-500 ms, protože API s našeptávačem je volané skrze Nette ajax a Nette controller. Je to z důvodů, že API je zaheslované statickým heslem a PHP skript toto heslo skryje narozdíl od přímého volání z javascriptu na frontendu. Do budoucna bych chtěl i tuto vrstvu vypustit.

Specifikem projektu bylo i to, že našeptávač musí rozlišovat části Prahy a tak pole obsahuje kromě měst i všechny části Prahy.

Celý kód je v samostatné knihovně dostupný na GitHubu: [czech-cities-autocomplete](https://github.com/buresmi7/czech-cities-autocomplete)

Pro samotný našeptávač jsem použil knihovnu [typeahead.js](https://twitter.github.io/typeahead.js/) a tento kód:

```javascript
$('.city-autcomplete').typeahead({
    source: function (query, process) {
        return $.get('/get-city-name?search=' + query, {}, function (data) {
            return process(data);
        });
    },
    delay: 0.5,
    highlight: false,
    minLength: 3,
    autoSelect: true,
    showHintOnFocus: true,
    fitToElement: true,
    displayText: function(item) {
      return item.name + ' (' + item.parent + ', ' + item.region + ')';
    },
    matcher: function(item) {
      return true;
    }
});
```