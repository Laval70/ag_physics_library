Jag hade ett problem med att klona en lista så att objecten i listan fortfarade var en instans av Vec2 classen.
Jag testade många lösningar, som t.ex. JSON.parse(JSON.stingify(list)) och stucturedClone(list), men inget fungerade.
Då hade jag inget annat att testa än att skriva en egen funktion som fungerade. 


cloneList() funkar inte 