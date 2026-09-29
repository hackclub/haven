import { defaultSiteData } from "./data/site";
import { browser } from "$app/environment";

const LANG_KEY = "language";
let langState = $state(defaultSiteData.defaultLang);

// loading a count from the local storage if it exists
if (browser && localStorage.getItem(LANG_KEY) !== null) {
    langState = localStorage.getItem(LANG_KEY) || defaultSiteData.defaultLang
}

export const setLang = (lang: string) => {
    langState = lang;
    localStorage.setItem(LANG_KEY, lang);
};

export const getLang = () => {
    return langState
}