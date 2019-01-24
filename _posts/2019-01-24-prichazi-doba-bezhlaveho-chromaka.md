---
layout: posts
title: Přichází doba bezhlavého chromáka
category: programovani
category_title: Programování
tags: []
comments: true
---
Možná jste zaznamenali, že Microsoft Edge přechází na stejné jádro jako Google Chrome a s tím i tezi, že internet ovládne jedno vykreslovací jádro, potažmo jedem webový prohlížeč. 

Má to spoustu výhod i nevýhod, o kterých se dá dlouze spekulovat, ale já bych rád upozornil, že prohlížeč Chrome začíná dominovat i na jiném poli. Mám na mysli Headless Chrome, neboli variantu, kterou lze pouštět a ovládat strojove přes API.

Ale nejdříve trochu blablabla okolo...

V jednom současném projektu jsem řešil zdánlivě jednoduchou úlohu: poslat emailem graf vývoje ceny. Nakreslit graf, to bylo jednoduché - přes knihovnu, která vygeneruje SVG (dělají to tak všechny, na které jsem narazil). Ale *Gmail* SVG nepodporuje, takže bylo nutné převést SVG na obrázek, což zní jednoduše, ale brzy jsem zjistil, že se jedná vlastně o úlohu převodu HTML na obrázek.

A tady nastupuje právě *Headless Chrome*. Pokud chcete interpretovat HTML včetně CSS opravdu dobře, zjistíte, že prohlížeč, je ten který to umí nejlépe. A navíc umí dělat screeshoty - to je přesně to co potřebuji. A tak v mém případě to znamenalo spustit v *AWS Lambda* prohlížeč Chrome. A překvapivě to funguje velice rychle a bez problémů.

A ta myšlenka? 

Jasně, už jsem blízko... :)

Vzpomínám si jak složitě generuje jiný starší projekt PDFka...no, co umí Chrome také dobře, jsou samozřejmě PDF - ideální použití bez starosti, jestli náhodou bude HTML a CSS vypadat dobře (u knihoven tohoto typu to není zcela běžné). Bude a navíc stejně jako na webu a jak jsme zvyklí.

Když to domyslím dál, mohl bych:
* jednoduše převádět i obrázky do PDF
* také převést PNG do JPEG a obráceně
* složit několik obrázků dohromady
* pomocí html něco do obrázku přikreslit a pak z toho udělat obrázek jiný, například oblíbený rámeček k vaší fotce se psem :)
* no a třeba animace, stačí trocha javascriptu a mohu si vygenerovat sekvenci obrázků
* udělat obrázek z určité části videa na youtube

Možná si někdo řekne, proč používat takový moloch na tak jednoduché věci. Podle mě proto, že je to jednoduché, kvalitou interpretace HTML a CSS je na úrovni dnešního standartu a už je to tak rychlé, že pokud člověk nehoní milisekundy, je to dostačující řešení.
