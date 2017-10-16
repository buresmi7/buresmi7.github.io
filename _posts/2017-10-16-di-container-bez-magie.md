---
layout: posts
title: DI Container bez magie
category: programovani
category_title: Programování
tags: []
comments: true
---
Občas není lehké přesvědčit kolegy o vašem skvělém nápadu a pak se občas vyplatí prostě ten nápad uskutečnít a konstatovat, že to funguje a všem se ulehčí život. Tak nějak jsem kdysi v pašoval do jedné staré aplikace [Nette DI Container](https://github.com/nette/di). Popravdě ten argument je jak kladivo, který přesvědčil i mě, ačkoliv jsem pořádně netušil jak takový kontejner funguje uvnitř. 

Trocha sebereflexe, PHP reflexe, šťouravý kolega Tomáš a o pár měsíců později jsme měli vlastní DI kontejner, který uměl to samé (tedy to co jsme využívali) a navíc zjištění, že to je v zásadě jednoduchý kus kódu. Až nedávno jsem si uvědomil (po přečtení překladu [Nechte kouzla zmizet](https://blog.zvestov.cz/software%20development/2017/09/18/nechte-kouzlo-zmizet.html)), že jsme právě nechali zmizet všechna kouzla a DI kontejner už není ta kouzelná věc co za mě vyřeší pár problému. Pokud si chcete zachovat svět plný kouzel, nečtěte raději dál.

Krom jiného jsem zjistil, že není potřeba generovat žádnou keš, netřeba konfigurovat nic v neonu a rychle jsem si na to zvykl. Jediné co mi vrtalo hlavou, jestli to bude stejně rychlé, neboď Nette DI Container se chlubí právě rychlostí.

Naštěstí jsem si našel trochu času a pustil se do měření a s výsledkem jsem spokojený, protože vlastní DI kontejner pomalejší není. Celý test jsem dal [sem](https://github.com/buresmi7/di-container-speed-test), kde je k nahlédnutí jak kód tak i výsledky.

Takže vzhůru ke strojům a všichni začněte psát své vlastní DI kontejnery. Anebo si prohlédněte alespoň ten, který jsme napsali společně s kolegou Tomášem: [SimpleDI](https://github.com/Travelport-Czech/SimpleDi).

