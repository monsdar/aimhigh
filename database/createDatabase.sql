-- phpMyAdmin SQL Dump
-- version 3.5.3
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 17. Feb 2013 um 16:38
-- Server Version: 5.1.66-0+squeeze1
-- PHP-Version: 5.3.3-7+squeeze14

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `ks01495db3`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `activations`
--

CREATE TABLE IF NOT EXISTS `activations` (
  `ActivationId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `TaskId` int(10) unsigned NOT NULL,
  `ActivationDate` date NOT NULL,
  PRIMARY KEY (`ActivationId`),
  KEY `fk_activations_tasks_idx` (`TaskId`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=911 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tasks`
--

CREATE TABLE IF NOT EXISTS `tasks` (
  `TaskId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `KeyId` int(11) NOT NULL,
  `Category` varchar(20) NOT NULL DEFAULT 'Tasks',
  `Title` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Text` varchar(160) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `IsNegative` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`TaskId`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3968 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `userkeys`
--

CREATE TABLE IF NOT EXISTS `userkeys` (
  `KeyId` int(11) NOT NULL AUTO_INCREMENT,
  `UserKey` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`KeyId`),
  UNIQUE KEY `UserKey` (`UserKey`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=411 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
