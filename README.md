# 📚 UBB Scraper


Aplikacja webowa do przeglądania planu zajęć dla kierunku **Informatyka** na **Uniwersytecie Bielsko-Bialskim (UBB)**. Umożliwia wybór semestru, trybu studiów oraz dynamiczne pobieranie przedmiotów i ich koordynatorów.

![Demo](https://cdn.discordapp.com/attachments/1065030439946965125/1351855770748063825/image.png?ex=67dbe54c&is=67da93cc&hm=fb173b04575fae7dbba60e7627dae9096409ef296c53c529f36ef09567468fdd&) <!-- Możesz dodać screenshot apki -->

---

## **🚀 Funkcjonalności**
✅ **Wybór semestru** (2, 4, 6)  
✅ **Wybór trybu studiów** (**stacjonarne / zaoczne**)  
✅ **Dynamiczne pobieranie przedmiotów** na podstawie semestru i trybu  
✅ **Lista przedmiotów z koordynatorami**  
✅ **Przełącznik Dark Mode / Light Mode** 🌙🌞  
✅ **Stylowanie za pomocą Styled Components** 🎨  
✅ **Responsywność - działa na desktopie i mobilce** 📱  
✅ **Zapis wybranego motywu w `LocalStorage`**  

---

## **🛠 Instalacja i uruchomienie**
### **1️⃣ Klonowanie repozytorium**
```bash
git clone https://github.com/UBBGenzie/ubb-scraper.git
cd ubb-scraper
```

### **2️⃣ Instalacja frontendu**
```bash
cd frontend
npm install
npm start
```
Aplikacja powinna działać na [`http://localhost:3000`](http://localhost:3000) 🎉

### **3️⃣ Instalacja backendu**
```bash
cd ../backend
npm install
node server.js
```
Backend powinien działać na [`http://localhost:3001`](http://localhost:3001)
