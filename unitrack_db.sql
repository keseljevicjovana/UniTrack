CREATE DATABASE unitrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unitrack_db;
-- chat mi je ovo dodao na moju bazu kad sam mu poslala da ispravi
-- u sustini ovo je samo da mogu nasa slova da funkcionisu i da bude okej

-- 1. KORISNICI 
-- pravila sam prvo 3 tabele ali je chat ispravio i rekao da je bolje jedna ali ima ovo enum
-- tu se kao korisnici tj studenti profesori i partneri razlikuju po ulozi
-- valjda je tako lakse i bolje generalno za kasnije
CREATE TABLE korisnici (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentski_id VARCHAR(20) UNIQUE DEFAULT NULL, -- NULL za admine i partnere
    ime VARCHAR(50) NOT NULL,
    prezime VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    lozinka VARCHAR(255) NOT NULL,
    uloga ENUM('student', 'admin', 'partner', 'superadmin') NOT NULL,
    anonimno TINYINT(1) DEFAULT 0,
    aktivan TINYINT(1) DEFAULT 1, -- Za suspendovanje naloga
    datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (studentski_id)
);

-- 2. KATEGORIJE 
-- 40, 25, 20, 15
CREATE TABLE kategorije_bodova (
    id INT PRIMARY KEY,
    naziv VARCHAR(50) NOT NULL,
    procenat_udjela INT NOT NULL 
);

-- 3. DOGAĐAJI / PROJEKTI (Ključno za Masovni Import UC-2, UC-3)
-- umjesto da upisujemo npr ucesce na hakatonu 100 puta, napravila sam samo jedan dogadjaj
CREATE TABLE dogadjaji (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv_dogadjaja VARCHAR(255) NOT NULL,
    opis TEXT,
    kategorija_id INT,
    organizator_id INT, -- ID partnera ili admina koji je kreirao
    fiksni_bodovi INT DEFAULT 0,
    datum_odrzavanja DATE,
    FOREIGN KEY (kategorija_id) REFERENCES kategorije_bodova(id),
    FOREIGN KEY (organizator_id) REFERENCES korisnici(id)
);

-- 4. AKTIVNOSTI (ko sta i kad je odobio)
CREATE TABLE aktivnosti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    dogadjaj_id INT DEFAULT NULL, -- Ako je iz masovnog importa
    kategorija_id INT NOT NULL,
    opis_rucni TEXT, -- Koristi se samo za UC-4 (pojedinačna verifikacija)
    broj_bodova INT NOT NULL,
    verifikovao_admin_id INT NOT NULL, -- KO JE ODOBRIO (Audit Trail)
    datum_unosa TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('na_cekanju', 'odobreno', 'odbijeno') DEFAULT 'odobreno',
    FOREIGN KEY (student_id) REFERENCES korisnici(id) ON DELETE CASCADE,
    FOREIGN KEY (dogadjaj_id) REFERENCES dogadjaji(id),
    FOREIGN KEY (kategorija_id) REFERENCES kategorije_bodova(id),
    FOREIGN KEY (verifikovao_admin_id) REFERENCES korisnici(id)
);

-- 5. PARTNERI I KAMPANJE
CREATE TABLE partneri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    korisnik_id INT, -- Veza sa tabelom korisnici za login
    naziv_kompanije VARCHAR(100) NOT NULL,
    tip_usluge VARCHAR(50), -- menza, teretana, IT kompanija...
    logo_url VARCHAR(255),
    FOREIGN KEY (korisnik_id) REFERENCES korisnici(id)
);

-- 6. VAUČERI
CREATE TABLE vauceri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    partner_id INT NOT NULL,
    kod_vaucera VARCHAR(50) UNIQUE NOT NULL,
    popust_procenat INT NOT NULL,
    datum_izdavanja TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vazi_do DATE NOT NULL,
    status ENUM('aktivan', 'iskoriscen', 'istekao') DEFAULT 'aktivan',
    datum_koriscenja DATETIME DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES korisnici(id),
    FOREIGN KEY (partner_id) REFERENCES partneri(id)
);

-- INSERT OSNOVNIH PODATAKA
INSERT INTO kategorije_bodova (id, naziv, procenat_udjela) VALUES 
(1, 'Akademski uspjeh', 40),
(2, 'Vannastavne aktivnosti', 25),
(3, 'Društveni doprinos', 20),
(4, 'Posebna postignuća', 15);