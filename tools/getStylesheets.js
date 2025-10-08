let css= [];

for (const sheet of document.styleSheets) {
  let rules
  try {
    rules = sheet.cssRules;
  } catch(e) {
    console.warn(sheet);
    continue;

  }

  for (const rule of rules) {
    if ('cssText' in rule)
      css.push(rule.cssText);
    else
      css.push(rule.selectorText+' {\n'+rule.style.cssText+'\n}\n');
  }
}
copy(css.join('\n'))