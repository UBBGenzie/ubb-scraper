import React, { useState, useEffect } from "react";
import axios from "axios";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";

// 🎨 Light i Dark mode style
const lightTheme = {
  background: "#f5f7fa",
  text: "#333",
  containerBg: "#fff",
  buttonBg: "#CA054D",
  buttonHover: "#FA387F",
  semesterActive: "#FACC15",
  semesterInactive: "#e0e0e0",
  subjectBg: "#f1f1f1",
};

const darkTheme = {
  background: "#121212",
  text: "#f5f5f5",
  containerBg: "#1e1e1e",
  buttonBg: "#CA054D",
  buttonHover: "#FA387F",
  semesterActive: "#FACC15",
  subjectBg: "#333",
};

// 🌍 Global Styles
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', sans-serif;
    background-color: ${(props) => props.theme.background};
    color: ${(props) => props.theme.text};
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    transition: all 0.1s ease-in-out;
  }
`;

// 📦 Kontener
const Container = styled.div`
  width: 90%;
  max-width: 600px;
  background: ${(props) => props.theme.containerBg};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.1s ease-in-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 95%;
  }
`;

// 🏷 Nagłówek
const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

// 🔘 Przełącznik trybu
const ToggleButton = styled.button`
  background: ${(props) => props.theme.buttonBg};
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.1s;
  margin-bottom: 1rem;

  &:hover {
    background: ${(props) => props.theme.buttonHover};
  }
`;

// 📦 Kontener wyboru semestrów
const SemesterButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

// 🎓 Przycisk semestrów
const SemesterButton = styled.button`
  background: ${(props) =>
    props.$active ? props.theme.semesterActive : props.theme.semesterInactive};
  color: ${(props) => (props.$active ? "#fff" : "#333")};
  border: none;
  padding: 10px 15px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.1s;
  flex: 1;

  &:hover {
    background: ${(props) => (props.$active ? "#FACC15" : "#bdbdbd")};
  }
`;

// 📋 Stylowany select
const Select = styled.select`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  width: 80%;
  background: ${(props) => props.theme.containerBg};
  color: ${(props) => props.theme.text};

  @media (max-width: 480px) {
    font-size: 0.9rem;
    width: 100%;
  }
`;

// 📥 Przycisk pobierania
const FetchButton = styled.button`
  background: ${(props) => props.theme.buttonBg};
  color: white;
  border: none;
  padding: 12px 18px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.1s;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background: ${(props) => props.theme.buttonHover};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// 📜 Lista przedmiotów
const SubjectList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 1rem;
`;

// 📌 Element listy
const SubjectItem = styled.li`
  background: ${(props) => props.theme.subjectBg};
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  text-align: left;
`;

// 📚 Nazwa przedmiotu
const SubjectTitle = styled.strong`
  display: block;
  font-size: 1.1rem;
`;

// 👨‍🏫 Koordynator
const Coordinator = styled.em`
  font-size: 0.9rem;
  color: #bbb;
`;

// 🎭 Komponent główny
function App() {
  const [semestr, setSemestr] = useState(2);
  const [mode, setMode] = useState("stacjonarne");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchData = () => {
    setLoading(true);
    setError(null);

    axios
      .get(`http://localhost:3001/scrape/${semestr}/${mode}`)
      .then((response) => {
        setSubjects(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania danych:", err);
        setError("Nie udało się pobrać danych.");
        setLoading(false);
      });
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Container>
        <ToggleButton onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Tryb jasny" : "🌙 Tryb ciemny"}
        </ToggleButton>

        <Title>Wybierz semestr i tryb studiów</Title>

        <SemesterButtons>
          {[2, 4, 6].map((num) => (
            <SemesterButton
              key={num}
              $active={semestr === num} // Zmieniamy `active` na `$active`
              onClick={() => setSemestr(num)}
            >
              Semestr {num}
            </SemesterButton>
          ))}
        </SemesterButtons>

        <Select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="stacjonarne">Stacjonarne</option>
          <option value="zaoczne">Zaoczne</option>
        </Select>

        <FetchButton onClick={fetchData} disabled={loading}>
          {loading ? "Ładowanie..." : "Pobierz dane"}
        </FetchButton>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <SubjectList>
          {subjects.map((subject) => (
            <SubjectItem key={subject.id}>
              <SubjectTitle>{subject.przedmiot}</SubjectTitle>
              <Coordinator>
                Koordynator: {subject.coordinator_name || "Brak danych"}
              </Coordinator>
            </SubjectItem>
          ))}
        </SubjectList>
      </Container>
    </ThemeProvider>
  );
}

export default App;
