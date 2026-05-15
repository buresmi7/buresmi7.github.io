---
layout: post
title: Když optional není undefined
categories: [Programování]
---
Vždycky jsem měl trochu odpor k `null`. Přišlo mi to jako taková cizí prázdnota, zatímco `undefined` byl přirozený obyvatel Javascriptu. Něco není, tak je to undefined. Hotovo, vyřešeno, můžeme jít domů.

V Typescriptu se mi s tím dlouho pracovalo docela hezky. Jenže upřímně, nikdy jsem si pořádně neuvědomil skutečný rozdíl mezi atributem, který v objektu chybí, a atributem, který v objektu je a má hodnotu `undefined`.

Nakonec mě to samozřejmě dohnalo. Tak už to v programování chodí. Věc, kterou člověk roky elegantně přehlíží, si jednoho dne sedne doprostřed cesty a odmítne se hnout. Tak jsem si problematiku trochu nastudoval. A s AI to šlo překvapivě hladce. Prostě se zeptáte, že tomu nerozumíte, a dostanete odpověď. Doba je v tomhle směru podezřele pohodlná.

Výsledek je drobná filozofická roztržka o tom, co znamená, že něco není. Budou tam typy, `undefined`, `null` a nakonec i Zod.

Začněme nevinně:

```typescript
type User = {
  name?: string
}
```

Na první pohled jasné. Uživatel může mít jméno, nebo nemusí. Jenže slovíčko "nemusí" se dá v Javascriptu vyložit dvěma způsoby.

```typescript
const user1 = {}
const user2 = { name: undefined }
```

V obou případech dostanu při čtení stejnou hodnotu:

```typescript
user1.name // undefined
user2.name // undefined
```

Ale stejné to není.

```typescript
'name' in user1 // false
'name' in user2 // true
```

A tady začíná ten malý průšvih. První objekt říká: atribut tu není. Druhý objekt říká: atribut tu je a jeho hodnota je `undefined`. To je pro obyčejné čtení skoro jedno, ale pro datové objekty, ukládání do databáze, diffy, update requesty a podobné radosti už to jedno být nemusí.

## Přesnější pravidlo

Začal jsem se proto přiklánět k tomuhle pravidlu:

```typescript
type User = {
  name?: string
}
```

znamená:

> `name` může v objektu chybět. Pokud tam je, musí to být string.

Neznamená:

> `name` může být string nebo explicitně undefined.

Pokud chci opravdu povinný atribut, který může obsahovat `undefined`, napíšu to takhle:

```typescript
type User = {
  name: string | undefined
}
```

To je jiný typ a říká něco jiného. A Typescript to umí hlídat, pokud zapneme:

```json
{
  "compilerOptions": {
    "exactOptionalPropertyTypes": true
  }
}
```

Najednou se z toho stane užitečný hlídač. Když někdo napíše:

```typescript
const user: User = {
  name: undefined
}
```

Typescript řekne ne. A má pravdu. Pokud jméno není, atribut má zmizet.

```typescript
const user: User = {}
```

Tohle je za mě čistší. V datových objektech nechci `undefined` jako hodnotu. `undefined` je lokální signál v kódu. Něco jako: funkce nic nenašla, mapa nemá klíč, proměnná ještě není nastavená. Ale jakmile stavím objekt, který pošlu přes API nebo uložím, měl bych mít jasno.

## A co null?

`null` je jiná věc. `null` je explicitní nic.

```json
{
  "name": null
}
```

To je normální JSON a má to jasný význam: atribut existuje a říká, že hodnota není. Dá se s tím udělat kontrakt. Například u update endpointu:

```typescript
type UpdateUser = {
  name?: string | null
}
```

Může znamenat:

```typescript
{}              // nech jméno být
{ name: 'Karel' } // nastav jméno
{ name: null }  // smaž jméno
```

To je čitelné. Jestli chceme `null` používat jako "clear" je jiná otázka. Někde ano, někde ne. Ale hlavní je, že `null` je součást datového kontraktu. `undefined` v JSONu není.

```typescript
JSON.stringify({ name: undefined }) // "{}"
```

Javascript tady udělá tiché kouzlo a atribut zahodí. Je to magie. A magii v kódu nemám rád.

## Do toho přichází Zod

Zod je výborný nástroj na ověření dat na hranách systému. Jenže dlouho měl jednu nepříjemnost:

```typescript
const schema = z.object({
  name: z.string().optional()
})
```

Typ z toho vyšel zhruba takhle:

```typescript
{
  name?: string | undefined
}
```

A runtime chování tomu odpovídalo:

```typescript
schema.parse({}) // OK
schema.parse({ name: 'Karel' }) // OK
schema.parse({ name: undefined }) // taky OK
```

To je v pořádku, pokud opravdu chceme povolit explicitní `undefined`. Ale pokud se snažíme držet pravidla "optional znamená chybějící atribut", tak je to moc široké.

Naštěstí se to v Zodu řešilo a [novější Zod](https://github.com/colinhacks/zod/releases/tag/v4.3.0) má metodu:

```typescript
const schema = z.object({
  name: z.string().exactOptional()
})
```

Ta říká přesně to, co potřebuji:

```typescript
schema.parse({}) // OK
schema.parse({ name: 'Karel' }) // OK
schema.parse({ name: undefined }) // chyba
```

Typově z toho vyjde:

```typescript
{
  name?: string
}
```

Tedy atribut může chybět. Pokud je přítomen, není `undefined`.

## Malé, ale důležité pravidlo

Výsledek je vlastně jednoduchý:

```typescript
z.string()
```

Hodnota musí být string.

```typescript
z.string().optional()
```

Hodnota může chybět, ale Zod pustí i explicitní `undefined`.

```typescript
z.string().exactOptional()
```

Atribut může chybět. Pokud existuje, musí být string.

```typescript
z.string().nullable()
```

Hodnota musí existovat a může být string nebo `null`.

```typescript
z.string().nullish()
```

Hodnota může být string, `null`, `undefined`, nebo atribut může chybět.

`nullish()` tedy není "lepší optional". Je to širší optional. Hodí se jen tam, kde opravdu chceme přijmout obě prázdnoty najednou.

## Proč se tím vůbec trápit

Protože datové objekty jsou smlouva. A když do smlouvy připustíme `undefined`, často tím neříkáme "tohle je stav". Říkáme jen "někde v kódu se nám nechtělo ten atribut odstranit".

Na hraně systému má být pořádek:

- atribut chybí, když hodnota není součástí zprávy
- `null` je explicitní prázdná hodnota, pokud ji kontrakt používá
- `undefined` zůstává uvnitř lokálního kódu

Není to velká architektura. Je to jen úklid. Ale podobné malé úklidy rozhodují, jestli typy pomáhají, nebo jen vyrábí mlhu.

Takže moje současné pravidlo zní:

```typescript
type User = {
  name?: string
}
```

znamená, že `name` může chybět. Ne že může být `undefined`.

A pokud to mám ověřit Zodem, sahám po:

```typescript
z.string().exactOptional()
```

Konečně optional, který se chová jako optional.
