-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 15, 2019 at 12:52 PM
-- Server version: 5.7.19
-- PHP Version: 7.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `trads`
--

-- --------------------------------------------------------

--
-- Table structure for table `domain`
--

DROP TABLE IF EXISTS `domain`;
CREATE TABLE IF NOT EXISTS `domain` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `domain`
--

INSERT INTO `domain` (`id`, `name`, `description`, `created_at`, `user_id`) VALUES
(1, 'mail', 'traduction a utiliser pour les mails', '2018-01-04 00:00:00', 1),
(2, 'test', 'test', '2019-01-09 00:00:00', 2);

-- --------------------------------------------------------

--
-- Table structure for table `domain_to_lang`
--

DROP TABLE IF EXISTS `domain_to_lang`;
CREATE TABLE IF NOT EXISTS `domain_to_lang` (
  `domain_id` int(11) NOT NULL,
  `lang_id` varchar(5) NOT NULL,
  PRIMARY KEY (`domain_id`,`lang_id`),
  KEY `lang_id` (`lang_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `domain_to_lang`
--

INSERT INTO `domain_to_lang` (`domain_id`, `lang_id`) VALUES
(1, 'DE'),
(2, 'DE'),
(1, 'ES');

-- --------------------------------------------------------

--
-- Table structure for table `lang`
--

DROP TABLE IF EXISTS `lang`;
CREATE TABLE IF NOT EXISTS `lang` (
  `code` varchar(5) NOT NULL,
  KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `lang`
--

INSERT INTO `lang` (`code`) VALUES
('DE'),
('EN'),
('ES'),
('FR');

-- --------------------------------------------------------

--
-- Table structure for table `translation`
--

DROP TABLE IF EXISTS `translation`;
CREATE TABLE IF NOT EXISTS `translation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(190) NOT NULL,
  `domain_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`,`domain_id`),
  KEY `domain_id` (`domain_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `translation`
--

INSERT INTO `translation` (`id`, `key`, `domain_id`) VALUES
(4, '__lostpassword__', 1),
(3, '__registration__', 1),
(7, '__test_1__', 2);

-- --------------------------------------------------------

--
-- Table structure for table `translation_to_lang`
--

DROP TABLE IF EXISTS `translation_to_lang`;
CREATE TABLE IF NOT EXISTS `translation_to_lang` (
  `lang_id` varchar(5) NOT NULL,
  `translation_id` int(11) NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`lang_id`,`translation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `translation_to_lang`
--

INSERT INTO `translation_to_lang` (`lang_id`, `translation_id`, `value`) VALUES
('DE', 1, 'hallo a toi \r\n...'),
('ES', 1, 'hola a toi\r\n...');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `api_key`) VALUES
(1, 'rousse_h', 'rousse_h@etna.io', 'h_essuor'),
(2, 'etna', 'etna@etna.io', 'ante');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `domain_to_lang`
--
ALTER TABLE `domain_to_lang`
  ADD CONSTRAINT `domain_to_lang_ibfk_1` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`id`),
  ADD CONSTRAINT `domain_to_lang_ibfk_2` FOREIGN KEY (`lang_id`) REFERENCES `lang` (`code`);

--
-- Constraints for table `translation`
--
ALTER TABLE `translation`
  ADD CONSTRAINT `translation_ibfk_1` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
