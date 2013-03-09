-- phpMyAdmin SQL Dump
-- version 3.5.3
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 09. Mrz 2013 um 16:41
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1728 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `taskpresets`
--

CREATE TABLE IF NOT EXISTS `taskpresets` (
  `PresetId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Title` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `Text` varchar(160) COLLATE utf8_unicode_ci NOT NULL,
  `Category` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `IsNegative` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`PresetId`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=17 ;

--
-- Daten für Tabelle `taskpresets`
--

INSERT INTO `taskpresets` (`PresetId`, `Title`, `Text`, `Category`, `IsNegative`) VALUES
(1, 'Build your Body', 'Exercise often, get fitter, faster and stronger', 'Health', 0),
(2, 'Bicycler', 'Instead of hitting the road with your car, you drove by bike!', 'Health', 0),
(3, 'Early Bird', 'Get out of bed early', 'Health', 0),
(4, 'Elevator', 'You took the elevator when you could take the stairs instead', 'Health', 1),
(5, 'Cook a meal', 'You created Haute Cuisine just by yourself!', 'Food', 0),
(6, 'Eat fruit', 'One apple a day keeps the doctor away', 'Food', 0),
(7, 'Eat vegetables', 'Eat a portion of raw vegetables', 'Food', 0),
(8, 'Sweets', 'Eating sweets will not help your diet plans', 'Food', 1),
(9, 'Fast Food', 'Better cook something healthy instead', 'Food', 1),
(10, 'Do it yourself', 'Spend some time on your personal projects', 'Productivity', 0),
(11, 'Blog Post', 'Contribute to your blog', 'Productivity', 0),
(12, 'Do the dishes', 'It''s easier if you do it more often', 'Productivity', 0),
(13, 'You''re an Expert', 'Commit something to a community like Stackoverflow', 'Productivity', 0),
(14, 'Ping a friend', 'Contact someone who you haven''t talked to in a while', 'Social', 0),
(15, 'Explain something', 'Explain something to someone. Anything counts.', 'Social', 0),
(16, 'Procrastination', 'You got better things to do than 9Gag and Facebook', 'Productivity', 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tasks`
--

CREATE TABLE IF NOT EXISTS `tasks` (
  `TaskId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `KeyId` int(11) NOT NULL,
  `Category` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'Tasks',
  `Title` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `Text` varchar(160) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `IsNegative` tinyint(1) NOT NULL DEFAULT '0',
  `Offdays` set('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`TaskId`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=12151 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `taskvotes`
--

CREATE TABLE IF NOT EXISTS `taskvotes` (
  `VoteId` int(11) NOT NULL AUTO_INCREMENT,
  `PresetId` int(11) NOT NULL,
  `KeyId` int(11) NOT NULL,
  PRIMARY KEY (`VoteId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `userkeys`
--

CREATE TABLE IF NOT EXISTS `userkeys` (
  `KeyId` int(11) NOT NULL AUTO_INCREMENT,
  `UserKey` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`KeyId`),
  UNIQUE KEY `UserKey` (`UserKey`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1158 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
