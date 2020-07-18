---
layout: post
title: Programuj bez výjimek!
categories: [Programování]
---
Dlouho, dlouho mě trápí kód ovládaný vyjímkami. Nikdy nevím jaká výjimka na mě vyskočí. A strach je podobný jako dopis od finančího úřadu.
V PHP je pokus to řešit anotacemi:

```php
/*
 * @return string
 *
 * @throws MyException
 */
public function getName()
{
    return "Baltazar"
}
```

Občas zapomeneš nějakou výjimku uvést, občas smazat a nikdo tě nenutí je tam psát.

Ale co je daleko horší, abys tohle správně zpracoval, musíš to trajkečnout, jen pro pořádek kolik je to psaní (raději v Typescriptu):

```typescript
let name: string | undefined
try {
  name = getName()
} catch (err) {

}
```

Ano pro mě zásadní problém je `let`, které používat nechci - chci přiřadit jméno a dále ho neměnit, ovšem `let` mi to dovolí a chyba je na světě. Navíc celý konstrukt je dlouhý a zbytečně nečitelný.

Pak je tu dilema s tím, jaký kód do try catche vložit. Poučka zní, že by to měl být nezbytně nutný kód. A co když kečuji nad několika funkcemi, je to dobře? Nikdy si nejsem jistý.

Další důvod proč výjimky nepoužívat je jejich tendence probublávat vrstvami. Tohle probublání si může dovolit pouze `LogicException`. V praxi ale vidím, že probublá kde co, ale často i, že se ignoruje vůbec existence těchto dvou typů výjimek.

V ideálním kódu by měla každá vrtva zabalit chybu do nějaké abstrakce a předchozí chybu uložit někam k podrobnostem. Stejně tak jako každá vrstva vytváří abstrakci, musí stejnou abstrakci vytvořit i pro chyby.

```typescript
interface Error {
  message: string
  previousError?: Error
}
```

Nechme tedy výjimky jejich původnímu smyslu a nechť shodí program. Nebude již více nutno rozlišovat `RuntimeException` a `LogicException`. Nyní všechny výjimky budou Logic. Jak elegantní.

Co dál? Typicky když po funkci chci odpověď na otázku zda dopadla dobře nebo špatně, vystačím si s návratovým typem `boolean`. Pokud mi nestačí při chybě vrátit `false`, ale musím rozlišovat mezi jednotlivými chybami, doteď jsem použil výjimku.

Nově však použiji návratovou hodnotu. Ovšem za cenu, že výsledek funkce nemohu vracet přímo ale v objektu.

```typescript
const getNickByYourAge = (age: number): { result?: string, error?: string } => {
  if (age < 33) {
    return {
      error: 'Ask your mother for your nick.'
    }   
  }

  if (age > 33) {
    return {
      error: 'Ask your children for your nick.'
    } 
  }

  return {
    result: 'Son of god'
  }
}
```

Vyrazně jednodušeji pak mohu funkci ošetřit:

```typescript
const nick = getNickByYourAge(30)
if (nick.error === 'Ask you mother for your nick.') {
  askMother()
}
console.log('Nick', nick.result)
```

Teď už to zbývá trochu doladit, např. abychom si byli jistí, že nevrátíme prázdný objekt `{}`.

```typescript
export type FunctionResult<T> = { error: string; result?: undefined } | { error?: undefined; result: T }
```

A vesele tak můžeme použít u všech funkcí:

```typescript
const getNickByYourAge = (age: number): FunctionResult<string> => {
  ...
}
```

Nehledě na programovací jazyk, výjimky nechávám na výjimečné situace. A ošetřování chyb je součástí zdrojového kódu a tak proč nepoužít obyčejné kostrukty.
