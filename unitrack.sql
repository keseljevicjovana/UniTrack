DROP DATABASE IF EXISTS unitrack_db;

CREATE DATABASE unitrack
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE unitrack;

CREATE TABLE uloge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO uloge (naziv)
VALUES
('admin'),
('studentska_sluzba'),
('firma'),
('student');

CREATE TABLE admini (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uloga_id INT NOT NULL,
    ime VARCHAR(100) NOT NULL,
    prezime VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    lozinka VARCHAR(255) NOT NULL,
    datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (uloga_id)
        REFERENCES uloge(id)
);

CREATE TABLE studentske_sluzbe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uloga_id INT NOT NULL,
    naziv_fakulteta VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    lozinka VARCHAR(255) NOT NULL,
    datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (uloga_id)
        REFERENCES uloge(id)
);

CREATE TABLE firme (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uloga_id INT NOT NULL,
    naziv_firme VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    lozinka VARCHAR(255) NOT NULL,
    pib VARCHAR(50),
    adresa VARCHAR(200),
    opis TEXT,
    datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (uloga_id)
        REFERENCES uloge(id)
);

CREATE TABLE studenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uloga_id INT NOT NULL,
    studentska_sluzba_id INT NOT NULL,
    ime VARCHAR(100) NOT NULL,
    prezime VARCHAR(100) NOT NULL,
    jmbg CHAR(13) NOT NULL UNIQUE,
    jedinstveni_id VARCHAR(50) NOT NULL UNIQUE,
    studentski_email VARCHAR(150) NOT NULL UNIQUE,
    lozinka VARCHAR(255) NOT NULL,
    broj_indeksa VARCHAR(50),
    godina_studija INT,
    smjer VARCHAR(100),
    datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prikaz_na_rang_listi ENUM('ime_prezime', 'jedinstveni_id') DEFAULT 'ime_prezime',

    FOREIGN KEY (uloga_id)
        REFERENCES uloge(id),

    FOREIGN KEY (studentska_sluzba_id)
        REFERENCES studentske_sluzbe(id)
        ON DELETE CASCADE
);

CREATE TABLE objave (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firma_id INT NOT NULL,
    naslov VARCHAR(200) NOT NULL,
    tekst TEXT NOT NULL,
    datum_objave TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (firma_id)
        REFERENCES firme(id)
        ON DELETE CASCADE
);

CREATE TABLE konkursi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firma_id INT NOT NULL,
    naslov VARCHAR(200) NOT NULL,
    opis TEXT NOT NULL,
    pozicija VARCHAR(150),
    maksimalan_broj_prijava INT NOT NULL,
    rok_prijave DATE NOT NULL,
    datum_objave TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (firma_id)
        REFERENCES firme(id)
        ON DELETE CASCADE
);

CREATE TABLE prijave_na_konkurse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    konkurs_id INT NOT NULL,
    student_id INT NOT NULL,
    datum_prijave TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (konkurs_id)
        REFERENCES konkursi(id)
        ON DELETE CASCADE,

    FOREIGN KEY (student_id)
        REFERENCES studenti(id)
        ON DELETE CASCADE,

    UNIQUE (konkurs_id, student_id)
);

CREATE TABLE aktivnosti_studenata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firma_id INT NOT NULL,
    student_id INT NOT NULL,
    tip ENUM('dogadjaj', 'volontiranje', 'praksa', 'radionica', 'drugo') NOT NULL,
    naziv VARCHAR(200) NOT NULL,
    opis TEXT,
    datum_aktivnosti DATE,
    datum_unosa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (firma_id)
        REFERENCES firme(id)
        ON DELETE CASCADE,

    FOREIGN KEY (student_id)
        REFERENCES studenti(id)
        ON DELETE CASCADE
);

CREATE TABLE predmeti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentska_sluzba_id INT NOT NULL,
    naziv VARCHAR(255) NOT NULL,
    sifra_predmeta VARCHAR(50),
    semestar INT,
    espb INT DEFAULT 0,
    obavezan TINYINT(1) DEFAULT 1,
    datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (studentska_sluzba_id)
        REFERENCES studentske_sluzbe(id)
        ON DELETE CASCADE
);

CREATE TABLE rezultati (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentska_sluzba_id INT NOT NULL,
    tip ENUM('ispit', 'kolokvijum', 'takmicenje', 'drugo') NOT NULL,
    naziv VARCHAR(200) NOT NULL,
    opis TEXT,
    datum_objave TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    predmet_id INT,

    FOREIGN KEY (studentska_sluzba_id)
        REFERENCES studentske_sluzbe(id)
        ON DELETE CASCADE,

    FOREIGN KEY (predmet_id)
        REFERENCES predmeti(id)
        ON DELETE SET NULL
);

CREATE TABLE rezultat_studenta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rezultat_id INT NOT NULL,
    student_id INT NOT NULL,
    bodovi DECIMAL(5,2),
    ocjena ENUM('A', 'B', 'C', 'D', 'E', 'F'),
    napomena TEXT,
    polozen TINYINT(1) DEFAULT 0,

    FOREIGN KEY (rezultat_id)
        REFERENCES rezultati(id)
        ON DELETE CASCADE,

    FOREIGN KEY (student_id)
        REFERENCES studenti(id)
        ON DELETE CASCADE,

    UNIQUE (rezultat_id, student_id)
);

CREATE TABLE bodovi_studenata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL UNIQUE,
    akademski_bodovi DECIMAL(8,2) DEFAULT 0.00,
    vannastavne_aktivnosti_bodovi DECIMAL(8,2) DEFAULT 0.00,
    drustveni_doprinos_bodovi DECIMAL(8,2) DEFAULT 0.00,
    posebna_postignuca_bodovi DECIMAL(8,2) DEFAULT 0.00,

    ukupno_bodova DECIMAL(8,2)
        GENERATED ALWAYS AS (
            akademski_bodovi * 0.40 +
            vannastavne_aktivnosti_bodovi * 0.25 +
            drustveni_doprinos_bodovi * 0.20 +
            posebna_postignuca_bodovi * 0.15
        ) STORED,

    datum_azuriranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES studenti(id)
        ON DELETE CASCADE
);

CREATE TABLE zahtjevi_za_stampanje_cv (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    studentska_sluzba_id INT NOT NULL,
    status ENUM('poslato', 'u_obradi', 'zavrseno', 'odbijeno') DEFAULT 'poslato',
    poruka TEXT,
    datum_zahtjeva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES studenti(id)
        ON DELETE CASCADE,

    FOREIGN KEY (studentska_sluzba_id)
        REFERENCES studentske_sluzbe(id)
        ON DELETE CASCADE
);























-- Pokreni ovo u MySQL Workbench-u, na POSTOJEĆOJ bazi "unitrack" (Query tab)
-- Ovo SAMO DODAJE — ne briše ništa, ne pravi novu bazu.
-- Bezbedno je pokrenuti i ako je dio ovoga već urađeno (koristi IF NOT EXISTS svuda).



-- 1. Dodaj kolonu "godina_studija" na postojeću tabelu "predmeti"
--    (potrebno za tab "Predmeti" i "Upis godine" u Sluzba dashboardu)
ALTER TABLE predmeti
ADD COLUMN godina_studija INT NOT NULL DEFAULT 1 AFTER semestar;

-- 2. Nova tabela: upisni period (da li je trenutno otvoren upis godine)
CREATE TABLE IF NOT EXISTS upisni_period (
    id INT PRIMARY KEY DEFAULT 1,
    aktivan TINYINT(1) NOT NULL DEFAULT 0,
    akademska_godina VARCHAR(20) DEFAULT NULL,
    datum_otvaranja TIMESTAMP NULL,
    datum_zatvaranja TIMESTAMP NULL
);

INSERT IGNORE INTO upisni_period (id, aktivan) VALUES (1, 0);

-- 3. Nova tabela: upisi studenata na predmete (po akademskoj godini)
CREATE TABLE IF NOT EXISTS upisi_predmeta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    predmet_id INT NOT NULL,
    akademska_godina VARCHAR(20) NOT NULL,
    godina_studija INT NOT NULL,
    datum_upisa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_upis (student_id, predmet_id, akademska_godina),

    FOREIGN KEY (student_id)
        REFERENCES studenti(id)
        ON DELETE CASCADE,

    FOREIGN KEY (predmet_id)
        REFERENCES predmeti(id)
        ON DELETE CASCADE
);

-- 4. Nova tabela: komponente bodova po tipu (prisustvo/test/kolokvijum.../zavrsni...)
CREATE TABLE IF NOT EXISTS bodovi_komponente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rezultat_id INT NOT NULL,
    student_id INT NOT NULL,
    tip_boda ENUM(
        'prisustvo',
        'test',
        'kolokvijum_redovni',
        'kolokvijum_popravni',
        'zavrsni_redovni',
        'zavrsni_popravni'
    ) NOT NULL,
    bodovi DECIMAL(6,2) NOT NULL DEFAULT 0,
    datum_unosa TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_komponenta (rezultat_id, student_id, tip_boda),

    FOREIGN KEY (rezultat_id)
        REFERENCES rezultati(id)
        ON DELETE CASCADE,

    FOREIGN KEY (student_id)
        REFERENCES studenti(id)
        ON DELETE CASCADE
);











 
-- Bodovi koje aktivnost donosi studentu (volontiranje, praksa, događaj...)
ALTER TABLE aktivnosti_studenata
ADD COLUMN bodovi DECIMAL(6,2) NOT NULL DEFAULT 0 AFTER opis;
 
-- Veza sa konkretnim konkursom (opciono - npr. ako je student dobio aktivnost
-- kroz konkurs na koji se prijavio; NULL ako je aktivnost uneta ručno bez konkursa)
ALTER TABLE aktivnosti_studenata
ADD COLUMN konkurs_id INT NULL AFTER firma_id;
 
-- NAPOMENA: ako sljedeća komanda baci grešku "Duplicate foreign key" ili slično,
-- znači da je veza već dodata ranije - samo preskoči ovu komandu i nastavi dalje.
ALTER TABLE aktivnosti_studenata
ADD CONSTRAINT fk_aktivnost_konkurs
    FOREIGN KEY (konkurs_id) REFERENCES konkursi(id) ON DELETE SET NULL;
 
 
 
 
 
 
 
 
 
 USE unitrack;

-- Dodaje smjer na predmete (opciono - NULL = zajednicki predmet za sve smjerove)
ALTER TABLE predmeti
ADD COLUMN smjer VARCHAR(100) NULL AFTER naziv;







-- OPCIONO: Ukloni stare "Programiranje 1" / "Baze podataka" unose koji su nastali
-- prije novog sistema komponenti bodova (nemaju predmet_id, nemaju bodovi_komponente).
-- Ovo je bezbedno - briše SAMO rezultate koji nikad nisu imali kolokvijum/zavrsni unos.

USE unitrack;

DELETE rs FROM rezultat_studenta rs
JOIN rezultati r ON rs.rezultat_id = r.id
WHERE r.predmet_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM bodovi_komponente bk WHERE bk.rezultat_id = r.id
  );

DELETE FROM rezultati
WHERE predmet_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM rezultat_studenta rs WHERE rs.rezultat_id = rezultati.id
  );
  
