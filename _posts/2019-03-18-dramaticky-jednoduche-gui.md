---
layout: posts
title: Dramaticky jednoduché GUI pro aplikace příkazové řádky (Windows OS)
category: programovani
category_title: Programování
tags: []
comments: true
---
To se jsem se zase jednou dostal do pěkně svízelné situace, když jsem kývnul na prosbu naprogramovat jednoduchou aplikaci. Vypadalo to na hodinku práce a abych trochu zamachroval, prohlásil jsem, že to je na 5 minut - za to si dlužím ještě nafackovat. Samozřejmě to trvalo asi 3 hodiny a to bzl teprve začátek.

Program samotný je docela jednoduchý - vzít `HTML` stránku a přechroustat data do Excelu. Naprogramoval jsem to jako řádkovou aplikaci v Node JS. Zásadní problém nastal tím, že uživatel, pro kterého aplikace byla určená, ihned po shlédnutí černé obrazovky příkazové řádky, se začal dožadovat klikátka. Ó bože a je to tu - takzvaná situace „sesuv na dálnici bez pořádného geologického průzkumu“. Co teď s tím? Napadlo mě toto:

* Přepsat aplikaci do jazyka s přímou podporou GUI, např. Visual Basic - roztomilý nápad, ale zahodit současnou práci se mi nechtělo.
* Použít GUI framework pro Javascript, např. Electron nebo NW.js. První jmenovaný byl moc složitý a druhý zas moc pomalý.
* Přepsat aplikaci z Node.js na aplikaci spustitelnou v browseru. To se dokonce podařilo ale narazilo to na CORS, neboť zdroj dat je HTML stránka starého neudržovaného eshopu.
* Vytvořit API pro jednoduchou HTML stránku. To mi přišlo moc složité i zhlediska distribuce ke klientovi.

Už jsem byl bezradný ale náhoda mě přivedla na Stackoverflow.com, kde jsem narazil na podivný název [HTA](https://en.wikipedia.org/wiki/HTML_Application). A nevěřil jsem vlastním očím, ono to funguje.

Takhle to vypadá v praxi:

![Video](/assets/posts/2019-03-18-dramaticky-jednoduche-gui/video.gif)

A takhle vypadá pod kapotou `run.bat`:
```batch
<!-- :: Batch section
@echo off
setlocal

echo Wait for action:
for /F "delims=" %%a in ('mshta.exe "%~F0"') do set "URL=%%a"
echo Run with url: "%URL%"
node .dist/index.js %URL%
set /p EXPORTNAME=<export-name.txt
start %EXPORTNAME%
goto :EOF
-->


<HTML>
<HEAD>
<HTA:APPLICATION SCROLL="no" SYSMENU="no" >

<TITLE>Eshop bio export</TITLE>
<SCRIPT language="JavaScript">
window.resizeTo(500,100);

function doExport(){
  var val = document.getElementById('url').value
  var fso = new ActiveXObject("Scripting.FileSystemObject");
  fso.GetStandardStream(1).WriteLine(val);
  window.close();
}

function doClose(){
  var fso = new ActiveXObject("Scripting.FileSystemObject");
  fso.GetStandardStream(1).WriteLine('');
  window.close();
}

</SCRIPT>
</HEAD>
<BODY>
    <input value="http://" id="url" style="width: 350px;">
    <button onclick="doExport();">Spustit</button>
    <button onclick="doClose();">Zavrit</button>
</BODY>
</HTML>
```

Poznámka: Protože knihovna pro vytváření `excel` souboru umí výsledek uložit na disk, přidal jsem k názvu souboru časovou značku a do speciálního souboru `export-name.txt` si ukládám název posledního vygenerovaného exportu. To vše mi umožní spustit export v `excelu` ihned po dokončení.

