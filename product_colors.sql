-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 03, 2026 at 08:34 PM
-- Server version: 8.0.45-0ubuntu0.22.04.1
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cs2team51_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `product_colors`
--

CREATE TABLE `product_colors` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `color` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_colors`
--

INSERT INTO `product_colors` (`id`, `product_id`, `color`) VALUES
(11, 1, 'Black'),
(12, 1, 'White'),
(13, 3, 'Black'),
(14, 3, 'Navy'),
(15, 4, 'Charcoal'),
(16, 4, 'Forest'),
(17, 5, 'Grey Marl'),
(18, 5, 'Ink'),
(19, 6, 'Black'),
(20, 6, 'Pine'),
(21, 7, 'White'),
(22, 7, 'Black'),
(23, 8, 'Lilac'),
(24, 8, 'Black'),
(25, 8, 'Cream'),
(26, 9, 'Fig'),
(27, 9, 'Sage'),
(28, 10, 'Oat'),
(29, 10, 'Black'),
(30, 11, 'Cinder'),
(31, 11, 'Berry'),
(32, 12, 'Light Wash'),
(33, 12, 'Black'),
(34, 13, 'Fog'),
(35, 13, 'Navy'),
(36, 14, 'Navy'),
(37, 14, 'Moon'),
(38, 15, 'Grey Marl'),
(39, 15, 'Black'),
(40, 16, 'Sky Blue'),
(41, 16, 'Red'),
(42, 17, 'Black'),
(43, 17, 'Purple'),
(44, 18, 'Yellow'),
(45, 18, 'Blue'),
(46, 19, 'Multi'),
(47, 19, 'White'),
(48, 20, 'Black'),
(49, 20, 'Navy'),
(50, 21, 'Black'),
(51, 21, 'White'),
(52, 21, 'Navy'),
(53, 22, 'Red'),
(54, 22, 'Blue'),
(55, 22, 'Green'),
(56, 23, 'Black'),
(57, 23, 'Graphite'),
(58, 24, 'White'),
(59, 24, 'Black'),
(60, 24, 'Grey'),
(61, 25, 'Khaki'),
(62, 25, 'Navy'),
(63, 25, 'Black'),
(64, 26, 'Black'),
(65, 26, 'Pink'),
(66, 26, 'White'),
(67, 27, 'Purple'),
(68, 27, 'Orange'),
(69, 27, 'Teal');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `product_colors`
--
ALTER TABLE `product_colors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_colors_product` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `product_colors`
--
ALTER TABLE `product_colors`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product_colors`
--
ALTER TABLE `product_colors`
  ADD CONSTRAINT `fk_colors_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
