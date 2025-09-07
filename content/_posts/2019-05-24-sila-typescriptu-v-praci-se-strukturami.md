---
layout: post
title: Síla Typescriptu v práci se strukturami
categories: [Programování]
---
Už nějaký ten měsíc programuji v Typescriptu a hlavou se mi často honí, proč je to tak zábavnější než jazyky, se kterými jsem se dosud setkal. Jmenovitě C++, PHP, Javascript. Typescript kombinuje ze všech něco a to zásadní je typová kontrola, známá syntaxe, rychlé prototypování. Ovšem hlavní síla podle mě je a i podle jiných, od kterých to slýchám když chodím okolo kuřáckého koutku, kde se samozřejmě živě diskutuje o všem možném. I o Typescriptu.

Ta síla je v práci se strukturami, které se jednoduše tvoří a dají se hezky skládat. Připravil jsem si jeden zajímavý příklad.

Nadefinujme si nějaké struktury:
```typescript
interface ZnalostBoje {
	bezeZbrane: number
	jednorucniMec?: number
	obourucniMec?: number
	stit?: number
}

interface Trpaslik {
	jmeno: string
	znalostBoje?: ZnalostBoje
	znalostMluvy: boolean
	znalostCetby: boolean
}
```

A rovnou si vytvoříme nějaké objekty:
```typescript
const trpasliCoUmiCist: Trpaslik = {
	jmeno: 'Lars',
	znalostMluvy: true,
	znalostCetby: true
}

const trpaslikCoUmiMachatMecem: Trpaslik = {
	jmeno: 'Olaf',
	znalostBoje: {
	  jednorucniMec: 10
	},
	znalostMluvy: true,
	znalostCetby: false
}
```

Ukázková funkce nepracuje s trpaslíky ale s bojovníky, což né každý trpaslík splňuje:
```typescript
interface BytostSeZnalostiBoje {
	znalostBoje: ZnalostBoje
}

const bojovaArena = (bojovnici: BytostSeZnalostiBoje[]): BytostSeZnalostiBoje => {
	...
}
```

První ukázka naznačuje, že Typescript opravdu nedovolí bojovat každému trpaslíkovi:
```typescript
(trpaslici: Trpaslik[]) => {
	const bojovnici = trpaslici
	
	bojovaArena(bojovnici) // chyba: typ Trpaslik nemusí obsahovat znalostBoje
}
```

Zde je již funkční příklad, na kterém je vidět jak lehce bez žádných dalších definic struktur vytvoříme pouze trpaslíky, kteří umí bojovat:
```typescript
(trpaslici: Trpaslik[]) => {
	const bojovnici = trpaslici.map((trpaslik) => {
		if (!trpaslik.znalostBoje) {
			throw new Error('Muze bojovat pouze trpaslik se znalostBoje.')
		}
		
		return {
			...trpaslik,
			znalostBoje: trpaslik.znalostBoje
		}
	})
	
	bojovaArena(bojovnici) // funguje
}
```

Upozorním, že konstanta `bojovnici` je tohoto typu:
```typescript
{
	jmeno: string
	znalostBoje: ZnalostBoje
	znalostMluvy: boolean
	znalostCetby: boolean
}
```
Pro jistotu dodávám, že `znalostBoje` je zde již povinná. A to je to co jsme chtěli.
