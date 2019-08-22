---
layout: post
title: Příjemné testování v Reactu
categories: [Programování]
---
Už je to pár měsíců, co jsem začal psát aplikaci v Reactu (konečně!) a nebyla by to pořádná aplikace, kdyby něměla nějaké ty testy. Kromě unit testů mám rád testy, které přímo pracují s UI, jsou komplexní a otestují celý proces, který provádí uživatel. A jeden takový chci ukázat. Pro test jsem použil knihovnu `jsdom` místo `Enzyme`, protože mi přišlo jednoduší testování včetně vnořených komponent. Nebylo to jednoduché ale po mnoha testech a mnoha přepisování, myslím, že jsem spokojený s podobou testů. Bezvadné je, že to funguje i s Reduxem. Trochu oříšek bylo čekání na načtení dat. Původně jsem to řešil přes `setTimeout()`, který zařadil další zpracování na konec smyčky vykonávaných příkazů. Nakonec pro hezký zápis používám knihovnu `timeout-as-promise`. A teď s radostí do dalších testů.

```javascript
import {afterEach, beforeEach, describe, it} from 'mocha';
import TestUtils from 'react-dom/test-utils';
import React from 'react';
import {expect} from 'chai';
import jsdom from 'jsdom-global';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import delay from 'timeout-as-promise';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore} from 'redux';

import {setId} from '../actions';
import {rootReducer} from '../reducers';
import {initialState} from '../initialState';
import ConnectedComponent from './Component';

const middleware = [thunk];

const enhancer = compose(
    applyMiddleware(...middleware),
);

const initStore = () => {
    return createStore(rootReducer, initialState, enhancer);
};

const createComponent = (store) => {
    return TestUtils.renderIntoDocument(<Provider store={store}><ConnectedComponent/></Provider>);
};

const getComponent = (component) => {
    return TestUtils.findRenderedDOMComponentWithClass(component, 'component-css-selector');
};

const baseApiUrl = settings.backofficeApiUrl[mode.UNIT_TEST];

describe('Test Component', function () {
    beforeEach(function () {
        global.cleanup = jsdom();
    });

    afterEach(function () {
        fetchMock.reset();
        fetchMock.restore();
        global.cleanup();
    });

    it('should show', async () => {
        fetchMock.getOnce('http://apiurl.local', {status: 200, message: 'OK', data: {id: 10, data: 'data'}});

        const store = initStore();
        const c = getComponent(createComponent(store));
        const input = c.querySelector('input');

        expect(input.value).to.equal('');
        expect(input.hasAttribute('disabled')).to.equal(true);

        await store.dispatch(setId(10));

        expect(input.value).to.equal('Načítám...');
        expect(input.hasAttribute('disabled')).to.equal(true);

        await delay();

        expect(input.value).to.equal('data');
        expect(input.hasAttribute('disabled')).to.equal(false);
    });
});
```

A ještě jak takový test pustit:

```javascript
mocha --require babel-register --require babel-polyfill app/react/src/**/*.test.js --recursive --sort
```
