-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Jan 27, 2026 at 05:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `booking_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `service_name` varchar(150) NOT NULL,
  `service_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `note` text DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'pending' COMMENT 'pending, confirmed, completed, cancelled',
  `payment_status` varchar(30) NOT NULL DEFAULT 'unpaid' COMMENT 'unpaid, partial, paid',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_date`, `start_time`, `end_time`, `customer_id`, `service_name`, `service_amount`, `note`, `status`, `payment_status`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(6, '2027-02-26', '13:01:00', '15:03:00', 6, 'fdsdfhh', 9000.00, 'asdsd dddddddd', 'pending', 'partial', 1, 1, '2026-01-21 08:49:39', '2026-01-23 06:57:02'),
(7, '2027-01-01', '05:30:00', '20:00:00', 2, 'hhh', 8000.00, 'hggjhj', 'pending', 'partial', 1, 1, '2026-01-21 09:01:28', '2026-01-22 11:34:20'),
(8, '2026-05-01', '17:30:00', '18:00:00', 2, 'ssssssss', 80000.00, 'as', 'pending', 'unpaid', 1, 1, '2026-01-21 09:03:28', '2026-01-21 09:03:28'),
(9, '2026-02-02', '17:05:00', '22:30:00', 6, 'dddddddddd', 80650.00, 'dddddddddddd', 'pending', 'partial', 1, 1, '2026-01-22 09:06:52', '2026-01-22 09:07:01'),
(10, '2026-01-19', '15:00:00', '16:00:00', 11, 'jahdkashd', 4000.00, 'sdfssssssssdsdsd', 'pending', 'unpaid', 1, 1, '2026-01-22 09:10:44', '2026-01-23 06:57:08'),
(11, '2027-01-22', '15:00:00', '16:00:00', 6, 'ssssssss', 8000.00, 'sssssssssss', 'pending', 'unpaid', 1, 1, '2026-01-22 09:12:15', '2026-01-22 09:12:15'),
(12, '2026-01-22', '15:00:00', '16:00:00', 2, 'bla bla', 8050.00, 'sdasdf', 'completed', 'unpaid', 1, 1, '2026-01-22 09:17:46', '2026-01-23 04:22:41'),
(13, '2026-02-02', '17:30:00', '18:03:00', 6, 'ssssss', 45000.00, 'sss', 'pending', 'unpaid', 1, 1, '2026-01-22 11:08:05', '2026-01-22 11:08:05'),
(14, '2026-01-23', '10:30:00', '12:00:00', 6, 'plumbing', 5000.00, 'pump', 'pending', 'unpaid', 1, 1, '2026-01-23 04:42:17', '2026-01-23 04:42:17'),
(15, '2026-01-23', '13:23:00', '17:30:00', 6, 'dddddddddd', 5000.00, 'sssssssss', 'completed', 'partial', 1, 1, '2026-01-23 04:59:08', '2026-01-26 07:25:48'),
(16, '2026-02-01', '13:30:00', '15:30:00', 2, 'cleaning ', 12000.00, 'very good cleaning', 'pending', 'partial', 1, 1, '2026-01-23 05:14:07', '2026-01-23 05:29:50'),
(17, '2026-01-26', '01:26:00', '15:00:00', 14, 'momo', 4500.00, NULL, 'pending', 'unpaid', 1, 1, '2026-01-26 11:15:10', '2026-01-26 11:15:10');

-- --------------------------------------------------------

--
-- Table structure for table `booking_staff`
--

CREATE TABLE `booking_staff` (
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `staff_id` bigint(20) UNSIGNED NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_staff`
--

INSERT INTO `booking_staff` (`booking_id`, `staff_id`, `assigned_at`, `assigned_by`) VALUES
(6, 10, '2026-01-22 09:45:48', NULL),
(7, 8, '2026-01-21 09:01:28', 1),
(7, 10, '2026-01-21 09:01:28', 1),
(8, 8, '2026-01-21 09:03:28', 1),
(8, 10, '2026-01-21 09:03:28', 1),
(9, 8, '2026-01-22 09:06:52', 1),
(10, 10, '2026-01-23 06:56:39', NULL),
(11, 8, '2026-01-22 09:12:15', 1),
(12, 8, '2026-01-22 09:17:46', 1),
(13, 10, '2026-01-22 11:08:05', 1),
(14, 10, '2026-01-23 04:42:17', 1),
(15, 10, '2026-01-23 04:59:08', 1),
(16, 8, '2026-01-23 05:14:07', 1),
(17, 8, '2026-01-26 11:15:10', 1);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `invoice_no` varchar(50) DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `issued_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `booking_id`, `invoice_no`, `file_path`, `issued_at`, `created_by`, `is_active`) VALUES
(2, 6, 'dd', '/uploads/invoices/1768989886704-781922320.png', '2026-01-21 15:34:46', 1, 0),
(3, 6, 'vff', '/uploads/invoices/1768990130904-569532814.png', '2026-01-21 15:38:50', 1, 1),
(6, 6, 'dddd', '/uploads/invoices/1768990245158-655817401.png', '2026-01-21 15:40:45', 1, 1),
(7, 16, 'kk', '/uploads/invoices/1769146669851-421121478.png', '2026-01-23 11:07:49', 1, 1),
(9, 16, 'ddf', '/uploads/invoices/1769146837978-190697260.png', '2026-01-23 11:10:37', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `method` varchar(40) DEFAULT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `paid_at` datetime NOT NULL DEFAULT current_timestamp(),
  `note` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `amount`, `method`, `reference_no`, `paid_at`, `note`, `is_active`, `created_by`, `updated_by`, `updated_at`) VALUES
(1, 1, 3000.00, 'cash', 'RCPT-001', '2026-01-20 16:04:48', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(2, 1, 3000.00, 'cash', 'RCPT-001', '2026-01-20 16:05:06', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(3, 1, 3000.00, 'cash', 'RCPT-001', '2026-01-20 16:05:25', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(4, 2, 10000.00, 'cash', 'RCPT-001', '2026-01-20 16:09:42', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(5, 6, 3000.00, 'Cash', 'kjhkjhk', '2026-01-21 14:39:17', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(6, 6, 2000.00, 'Online Transfer', NULL, '2026-01-21 15:00:34', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(7, 6, 3000.00, 'Cash', NULL, '2026-01-21 15:16:34', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(8, 9, 50000.00, 'Cash', 'ssssssss', '2026-01-22 14:37:01', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(9, 7, 100.00, 'Cash', NULL, '2026-01-22 17:04:20', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(10, 7, 300.00, 'Cash', NULL, '2026-01-22 17:04:23', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(11, 7, 520.00, 'Cash', NULL, '2026-01-22 17:04:28', NULL, 1, 1, NULL, '2026-01-23 05:20:55'),
(12, 16, 6000.00, 'Cash', 'ddddddddddddddddddddd', '2026-01-23 10:46:46', NULL, 1, 1, NULL, '2026-01-23 05:21:28'),
(13, 16, 5000.00, 'Cash', 'ghghg', '2026-01-23 10:59:50', NULL, 1, 1, NULL, '2026-01-23 05:29:50'),
(14, 16, 100.00, 'Cash', NULL, '2026-01-23 11:01:19', NULL, 1, 1, NULL, '2026-01-23 05:31:19'),
(15, 16, 100.00, 'Cash', NULL, '2026-01-23 11:05:20', NULL, 1, 1, NULL, '2026-01-23 05:35:20'),
(16, 16, 100.00, 'Cash', NULL, '2026-01-23 11:06:20', NULL, 1, 1, NULL, '2026-01-23 05:36:20'),
(17, 16, 50.00, 'Cash', NULL, '2026-01-10 05:30:00', NULL, 1, 1, NULL, '2026-01-23 06:09:09'),
(18, 15, 500.00, 'Cash', NULL, '2026-01-26 05:30:00', NULL, 1, 1, NULL, '2026-01-26 07:25:48');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` char(64) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`, `user_agent`, `ip`) VALUES
(1, 1, '73bee6b817dc97550374dd6d9c2cf0be7d083a0821b6cc8ab22e51ee95172df9', '2026-01-19 05:44:38', '2026-02-18 11:14:38', NULL, 'Thunder Client (https://www.thunderclient.com)', '::ffff:127.0.0.1'),
(2, 1, '771b259290f5fc5c43527da8f3ccfc566427d6585b51a6d63726d2d621380cd4', '2026-01-19 05:50:04', '2026-02-18 11:20:04', NULL, 'Thunder Client (https://www.thunderclient.com)', '::ffff:127.0.0.1'),
(3, 1, 'fdfb022f512194b851a4f441e86794a5628e4a8a62e4972c6d607ec24e4c7f53', '2026-01-19 06:17:09', '2026-02-18 11:47:09', NULL, 'Thunder Client (https://www.thunderclient.com)', '::ffff:127.0.0.1'),
(4, 1, '853266c28e332500b89bc35d5358a0a8c330b3fea63dd87afed9128f67639145', '2026-01-19 09:38:13', '2026-02-18 15:08:13', NULL, 'Thunder Client (https://www.thunderclient.com)', '::ffff:127.0.0.1'),
(5, 1, 'f6e74862fc9426884ce8c55430f9aaa8ba2b6a2de77eb36c39a7e299b58ef66c', '2026-01-19 09:53:52', '2026-02-18 15:23:52', NULL, 'Thunder Client (https://www.thunderclient.com)', '::ffff:127.0.0.1'),
(6, 1, 'ab266d85fb426945761edbacd326c8f099e625b1bfa01b5414c3dca6f587847d', '2026-01-20 10:21:22', '2026-02-19 15:51:22', NULL, 'Thunder Client (https://www.thunderclient.com)', '::ffff:127.0.0.1'),
(7, 1, '9c20eb117f49fdfed7a066bed90106653b63f9e5519198fb8a984f06b5ea4b7a', '2026-01-20 10:22:17', '2026-02-19 15:52:17', NULL, 'PostmanRuntime/7.51.0', '::1'),
(8, 1, 'f6032a52b7691baa34c4e9dbe389b38153c6493b516c351cbe97f58a3d1337a1', '2026-01-20 10:39:35', '2026-02-19 16:09:35', NULL, 'PostmanRuntime/7.51.0', '::1'),
(9, 1, '84558f2fa1cfe6f073609af787f22897da29143db883d40b3fdb1e24dcd8e110', '2026-01-20 10:56:55', '2026-02-19 16:26:55', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(10, 1, 'ee816976680154aee8e6cc08dc62ca4eb4b2533c972ac64a1c626b9b04c04783', '2026-01-20 10:57:22', '2026-02-19 16:27:22', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(11, 1, 'c377b9b49b160dd5cb26e254dfc7ef43d9314ecc4c0ec2e5fb8fdb8c1420420e', '2026-01-20 10:59:25', '2026-02-19 16:29:25', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(12, 1, '5f9f481c84ee6504a08ee1bf6f6a01c4588ad1033efc07740d4b7aa7900075ac', '2026-01-20 11:27:13', '2026-02-19 16:57:13', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(13, 1, 'c01ad05842a2334d5a36fd36d96a064539d27f2bc8a03fb5b6e00f6e42680d9d', '2026-01-20 11:27:32', '2026-02-19 16:57:32', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(14, 1, '21fef818dc04f5fef938eb975d1288ca4567a6077e033b858e99e53b83c09532', '2026-01-20 11:31:30', '2026-02-19 17:01:30', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(15, 1, '677f49ec7008a3e72e4ff673329920b3b5d2d00411d1dda136be8f84533f33c6', '2026-01-20 11:32:19', '2026-02-19 17:02:19', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(16, 1, 'c4eabc01411a5ae2a0c600286d6114d2c1a4609ee038c67cb7302a73e3e76e09', '2026-01-20 11:35:43', '2026-02-19 17:05:43', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(17, 1, '930295541c88b6e398202bb847fe9539f1d9924c37bb8c06c2e60bd7e5da5ebb', '2026-01-20 11:36:40', '2026-02-19 17:06:40', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(18, 1, 'a9396235fda29d8a0a24ebb80b61b5f473692556704ccfe625ae5245ca0350be', '2026-01-20 11:38:55', '2026-02-19 17:08:55', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(19, 1, '21a533a78db53ea2eed00f5c9ccddf618b5e02be7da2c202a904e25467ae6d1f', '2026-01-20 11:41:54', '2026-02-19 17:11:54', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(20, 1, 'd17264c7e4415d0fba5a8ea22466d3496a50177c1b344115d32a05e3f5a862d6', '2026-01-21 04:28:21', '2026-02-20 09:58:21', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(21, 1, '623d60540f6362ddd41b5da85f837dc2f0d6d482d1aece3a10268f566c511bb0', '2026-01-21 04:30:11', '2026-02-20 10:00:11', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(22, 1, 'f81cd2c0b81e1923020455336238d10b2ec1f5ceff6ab70905e04f13584a2e34', '2026-01-21 04:35:08', '2026-02-20 10:05:08', '2026-01-21 10:05:11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(23, 1, '98e9d22a91acd94ab1e1b7d27e02725198a2c51819fb082cb300bbc6d24472ee', '2026-01-21 04:35:11', '2026-02-20 10:05:11', '2026-01-21 10:05:13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(24, 1, '01abc32dc926cc77979518c898a16df1316ef2556a9f9b99ae6683e08e768427', '2026-01-21 04:35:13', '2026-02-20 10:05:13', '2026-01-21 10:05:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(25, 1, '2a16412cba52a0ae0ed30a633c5e4ee7ca70c6d56e8b6f2035c77e7f5fb4f449', '2026-01-21 04:35:16', '2026-02-20 10:05:16', '2026-01-21 10:07:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(26, 1, '65f49716c54d94ef5e32abec8aa5e9d7d272c8f96e8afcd89b6dbeaa486da11c', '2026-01-21 04:37:12', '2026-02-20 10:07:12', '2026-01-21 10:30:08', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(27, 1, '83586b8f0a3379d24f68b11e2b7105e43bd5f0442087863dc50e37cd15536dd3', '2026-01-21 05:00:08', '2026-02-20 10:30:08', '2026-01-21 10:30:21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(28, 1, '927447e8acc055274f596c5591387719fc2cf8f506d90570774a90a43374c4c3', '2026-01-21 05:00:21', '2026-02-20 10:30:21', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(29, 1, 'ad368b22a5964e9b34b4bc2ad24836dccc1db6114c93a396ff01e0bfe404bdbf', '2026-01-21 05:00:57', '2026-02-20 10:30:57', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(30, 1, '9afbb26b08951ea98779fa9c85dc34b75d91845c9b85423afb0145064b3204f6', '2026-01-21 05:03:34', '2026-02-20 10:33:34', '2026-01-21 10:40:35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(31, 1, '8254ce7e969969daedf96655e308191456d55e15875ae8620ad0c78ab996c41b', '2026-01-21 05:10:35', '2026-02-20 10:40:35', '2026-01-21 10:48:39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(32, 1, 'b0365ca1eab1b91c1c761f6f3cb3f788c218b71c32f25f87eef6e5b724314966', '2026-01-21 05:18:39', '2026-02-20 10:48:39', '2026-01-21 10:54:50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(33, 8, 'ca04a6fbf83f60e24b76ac84610121047827bc17cc55b58543469c8db35d5026', '2026-01-21 05:21:00', '2026-02-20 10:51:00', '2026-01-21 11:04:59', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(34, 1, 'b9db6adef03e69d85a5a18547036389678f5a0d232f915befdbf66f311afad7c', '2026-01-21 05:24:50', '2026-02-20 10:54:50', '2026-01-21 10:55:15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(35, 1, 'ac58494c248942872a98ea1f7788b00f8213962edc8742608eb879452b072441', '2026-01-21 05:25:15', '2026-02-20 10:55:15', '2026-01-21 11:04:59', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(36, 1, 'e9958957a82c63ac804b8bbfe3032bd774ec091065df26f7b1050f7d53805e06', '2026-01-21 05:34:59', '2026-02-20 11:04:59', '2026-01-21 11:05:07', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(37, 8, '56c9061440590c71b66ad1a124abe1ee92a54f589e85260d9de4ac0555a9ba07', '2026-01-21 05:34:59', '2026-02-20 11:04:59', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(38, 1, '5a4ce01a6011aefc12868f201a2d54afcc640332368e4c20469e1c885c999327', '2026-01-21 05:35:07', '2026-02-20 11:05:07', '2026-01-21 11:08:51', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(39, 1, 'dc94286cd3af9d7d8f4adce8ce915d5b934818c051445dcfba8ff750b615591d', '2026-01-21 05:38:51', '2026-02-20 11:08:51', '2026-01-21 11:09:24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(40, 1, '0e392347d8eea2e76636a045a907da3f818918ec256337c77fe109cebf2093aa', '2026-01-21 05:39:24', '2026-02-20 11:09:24', '2026-01-21 11:14:55', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(41, 1, 'c15abb02354efba6490b71000fd58a54c9cadcc0875fe9b06d3afed98b6b942c', '2026-01-21 05:44:55', '2026-02-20 11:14:55', '2026-01-21 11:20:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(42, 1, '4e3611672c843eee839e5981a6b36ba6e2997abb992b7d7dcf7bded5f81da546', '2026-01-21 05:46:36', '2026-02-20 11:16:36', NULL, 'PostmanRuntime/7.51.0', '::1'),
(43, 1, '698b00e39b91b0e30c6912eee0ec34747c8e14c3c37fa1e8837f8ad74b154038', '2026-01-21 05:50:56', '2026-02-20 11:20:56', '2026-01-21 11:21:02', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(44, 1, 'ac161df95f545a0067f287d7acd33508863a359eed6558d5d426a586898dd63c', '2026-01-21 05:51:02', '2026-02-20 11:21:02', '2026-01-21 11:21:03', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(45, 1, 'dd1b43fa007ed6cbc96e72d0beb5fe608797b23faee09da857d51cdad59c915b', '2026-01-21 05:51:03', '2026-02-20 11:21:03', '2026-01-21 11:21:03', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(46, 1, 'dd1b43fa007ed6cbc96e72d0beb5fe608797b23faee09da857d51cdad59c915b', '2026-01-21 05:51:03', '2026-02-20 11:21:03', '2026-01-21 11:28:57', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(47, 1, 'cc1fc20605ce1351c9ab0d82fbe07fb818539a0602795d81d8dd26f8f1c38ea2', '2026-01-21 05:58:57', '2026-02-20 11:28:57', '2026-01-21 11:33:29', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(48, 1, '28ec6cb785d090d42f77e05f7fcc063c72100bc69c381883e223dc16dbb35211', '2026-01-21 06:03:29', '2026-02-20 11:33:29', '2026-01-21 11:35:15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(49, 1, '1f48af759b9ec1f6a2362ee22089149ac3553016d81dd650241959f2da4d5d90', '2026-01-21 06:05:15', '2026-02-20 11:35:15', '2026-01-21 11:37:56', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(50, 1, '51372c66e582bf4da46bc527b1b11cb92f6438d6ebd8d2b63832c3db2d7d6f7a', '2026-01-21 06:07:56', '2026-02-20 11:37:56', '2026-01-21 11:42:14', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(51, 1, '76dded610f415195c79c7ed5375ac3e5181bce1a64377a1dda1f2c088a1dbcc3', '2026-01-21 06:12:14', '2026-02-20 11:42:14', '2026-01-21 11:46:31', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(52, 1, '6b0967e4f3cfc757db7910074d545a09966a71d829021c4dbd8f432ad20b0661', '2026-01-21 06:16:31', '2026-02-20 11:46:31', '2026-01-21 11:46:43', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(53, 1, '8ef6167adb5d855fe5e213c767961d75d85f47361bdec050f168d84b85893440', '2026-01-21 06:16:43', '2026-02-20 11:46:43', '2026-01-21 12:18:04', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(54, 1, '3743d51d80e9a7a6cec28918b811c2ded48d154baa918113f39d0dc0407ebf32', '2026-01-21 06:48:04', '2026-02-20 12:18:04', '2026-01-21 12:18:11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(55, 1, 'f9ce0e527d5d0088fc924c663830e9378cc6f29a4b3ce44b071f6a349bfe7252', '2026-01-21 06:48:11', '2026-02-20 12:18:11', '2026-01-21 12:18:11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(56, 1, 'f9ce0e527d5d0088fc924c663830e9378cc6f29a4b3ce44b071f6a349bfe7252', '2026-01-21 06:48:11', '2026-02-20 12:18:11', '2026-01-21 12:18:11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(57, 1, 'f9ce0e527d5d0088fc924c663830e9378cc6f29a4b3ce44b071f6a349bfe7252', '2026-01-21 06:48:11', '2026-02-20 12:18:11', '2026-01-21 12:18:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(58, 1, 'c4df7cea323a5d4627df900ed4e1be46c47886d234461ceaebe7a862bf5c7428', '2026-01-21 06:48:12', '2026-02-20 12:18:12', '2026-01-21 12:18:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(59, 1, 'c4df7cea323a5d4627df900ed4e1be46c47886d234461ceaebe7a862bf5c7428', '2026-01-21 06:48:12', '2026-02-20 12:18:12', '2026-01-21 12:19:51', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(60, 1, '1736c196bcd8f88b008018fffea91ed3a78ee42fe4a1f6b5dde5ccc1a33108a7', '2026-01-21 06:49:51', '2026-02-20 12:19:51', '2026-01-21 12:22:39', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(61, 1, 'e72a09ab95afcb4d665c04f55722065ca237c2e5d2cc09285186d34b90901c9b', '2026-01-21 06:52:39', '2026-02-20 12:22:39', '2026-01-21 12:22:54', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(62, 1, '35d4f1dadb867230413b9233a0c2ffe661c00b8fcc1a39b2c5415809f7b9bd1d', '2026-01-21 06:52:54', '2026-02-20 12:22:54', '2026-01-21 12:23:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(63, 1, '9dd90d2520c9146c99e9ab6acca146a990238fac96a6f030896e7f4f8888227f', '2026-01-21 06:53:16', '2026-02-20 12:23:16', '2026-01-21 12:23:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(64, 1, '9dd90d2520c9146c99e9ab6acca146a990238fac96a6f030896e7f4f8888227f', '2026-01-21 06:53:16', '2026-02-20 12:23:16', '2026-01-21 12:25:52', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(65, 1, 'f7797499c6a3fcdb70192c7e8399b6da682a2a4a46338fce9440db101533379d', '2026-01-21 06:55:52', '2026-02-20 12:25:52', '2026-01-21 12:31:02', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(66, 1, '25b4a374291319dfdd3de21ce629ca51f475e2d9843e46d890882424407dfc57', '2026-01-21 07:01:02', '2026-02-20 12:31:02', '2026-01-21 12:33:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(67, 1, 'd57c0d13a2552a95ebda397e4abf27e350e1a97ee67e10a9cb37109c8cc9c59b', '2026-01-21 07:03:16', '2026-02-20 12:33:16', '2026-01-21 12:38:34', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(68, 1, '6ba6b73374019a1f98491dcf7521da60849077b34ac85d53b1f299474411d617', '2026-01-21 07:08:34', '2026-02-20 12:38:34', '2026-01-21 13:28:01', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(69, 1, '9164ead12790c989b99bcd2a5f7b41c57363cffd81ee1342ead1b8e467e9d1b0', '2026-01-21 07:58:01', '2026-02-20 13:28:01', '2026-01-21 13:32:22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(70, 1, 'f285bfeb7e297cad093e377d845b5ac3f899b0481b10bf2fb6c583fd34c36bdc', '2026-01-21 08:02:22', '2026-02-20 13:32:22', '2026-01-21 13:32:29', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(71, 1, '4f0c9ae86a08b9c6c9283b122e21a98db9c57edde879b7c1e2aa5de5499f62da', '2026-01-21 08:02:29', '2026-02-20 13:32:29', '2026-01-21 13:32:39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(72, 1, '06d2470c8cfcd89fc061d9bcd6c187efd87c4f547a6b327cfd0001e75344b77e', '2026-01-21 08:02:39', '2026-02-20 13:32:39', '2026-01-21 13:32:44', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(73, 1, '4286fbff1fa99437669afe7d3c4b99e1624a946711c852f75303fecbf4c6a3df', '2026-01-21 08:02:44', '2026-02-20 13:32:44', '2026-01-21 13:33:19', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(74, 1, 'df0267028e3bf6f7dc0a246ac2161fb60a3d313b33359e284442c0d6d522297b', '2026-01-21 08:03:19', '2026-02-20 13:33:19', '2026-01-21 13:33:44', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(75, 1, 'd6a50896b7cb968a4f1f379520dd726791facd061e196094b6b459b896cc4cb7', '2026-01-21 08:03:44', '2026-02-20 13:33:44', '2026-01-21 13:35:03', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(76, 1, 'a5355f70d2def7381f36a2a47bb469df64d5118e72dcadebae782ca95c81eb36', '2026-01-21 08:05:03', '2026-02-20 13:35:03', '2026-01-21 13:35:03', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(77, 1, 'a5355f70d2def7381f36a2a47bb469df64d5118e72dcadebae782ca95c81eb36', '2026-01-21 08:05:03', '2026-02-20 13:35:03', '2026-01-21 13:35:04', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(78, 1, '0b8dc4edb76f6f04ad56df7213c3c04e8451371ceecd64a00f03841bc178fbd1', '2026-01-21 08:05:04', '2026-02-20 13:35:04', '2026-01-21 13:35:09', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(79, 1, 'b269bc3c8fca2213711053627d8ccf676934a5bbf9d92a7433c27831189a5e87', '2026-01-21 08:05:09', '2026-02-20 13:35:09', '2026-01-21 13:38:20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(80, 1, '7f45911fb31bf108ed51b1e50f7e0ca47707222d87c7d7a2cb6115c5586905d7', '2026-01-21 08:08:20', '2026-02-20 13:38:20', '2026-01-21 13:38:21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(81, 1, 'd127ff32d5bcae261bae3f239c28090f492779c41be5b09e611bbae3aa2b04ba', '2026-01-21 08:08:21', '2026-02-20 13:38:21', '2026-01-21 13:38:24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(82, 1, '6faec99ea092857233f34089777d9660821f71eae09f129f6df5845dfb0389ef', '2026-01-21 08:08:24', '2026-02-20 13:38:24', '2026-01-21 13:40:23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(83, 1, 'f54e0b5ffa101b95935b87be9be9c2f3e7d3f45c1928aabe266dacf9b38a3b0a', '2026-01-21 08:10:23', '2026-02-20 13:40:23', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(84, 1, '32b8a79cab972bfddc08e4455c9d641692be95a050a870c5647ea279ed190a0c', '2026-01-21 08:10:38', '2026-02-20 13:40:38', '2026-01-21 13:40:50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(85, 1, 'bea45abe438d459fb9998243ab005a6db4f9ab66af5c2474d6b437ef02994a1f', '2026-01-21 08:10:50', '2026-02-20 13:40:50', '2026-01-21 13:42:37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(86, 1, '339d3dc6c35e3cb199e111be7a13e48a4c9a34e24deaaf727f0571fd9b2f7c09', '2026-01-21 08:12:37', '2026-02-20 13:42:37', '2026-01-21 13:42:37', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(87, 1, '339d3dc6c35e3cb199e111be7a13e48a4c9a34e24deaaf727f0571fd9b2f7c09', '2026-01-21 08:12:37', '2026-02-20 13:42:37', '2026-01-21 13:42:41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(88, 1, 'fe8e0bfd641a39aade19a26fabdbacd558f02b5bf34dd6527d8181bb5e021fbe', '2026-01-21 08:12:41', '2026-02-20 13:42:41', '2026-01-21 13:44:44', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(89, 1, 'b54b1c80b09f4283a9a0497f20c99d18e44f4689f3017bc1d554167375d464b5', '2026-01-21 08:14:08', '2026-02-20 13:44:08', NULL, 'PostmanRuntime/7.51.0', '::1'),
(90, 1, 'a4c7f0efc3387facaeb16b2b7d88646d06100aafe2d9e4ad70314d9581cd0b6c', '2026-01-21 08:14:44', '2026-02-20 13:44:44', '2026-01-21 13:51:40', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(91, 1, 'a4c7f0efc3387facaeb16b2b7d88646d06100aafe2d9e4ad70314d9581cd0b6c', '2026-01-21 08:14:44', '2026-02-20 13:44:44', NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(92, 1, 'a9dd3a7703ddc4c328ea01e6b6dad64b85ec50444f46b6745f526aa9f7b76e22', '2026-01-21 08:21:40', '2026-02-20 13:51:40', '2026-01-21 13:55:35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(93, 1, '542f3ab326abe71fbcd25538074cc2179bb1b64ebc23bc7013fa5159780fd86c', '2026-01-21 08:25:35', '2026-02-20 13:55:35', '2026-01-21 13:57:14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(94, 1, '2ff04d8810f31d56137675292a886db1d7594fe5625ad2d592c02976acd246ab', '2026-01-21 08:27:14', '2026-02-20 13:57:14', '2026-01-21 14:02:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(95, 1, '77d7a5d1eb43d0984bc49a6fc54f8f6b4efdd11b1d7cadfc9b74e841f52289dd', '2026-01-21 08:32:12', '2026-02-20 14:02:12', '2026-01-21 14:02:27', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(96, 1, 'f446ccd8b1cc2d3bfd4792f89a36639ba3bfecf16c160d34863e3ce051801440', '2026-01-21 08:32:27', '2026-02-20 14:02:27', '2026-01-21 14:02:27', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(97, 1, 'f446ccd8b1cc2d3bfd4792f89a36639ba3bfecf16c160d34863e3ce051801440', '2026-01-21 08:32:27', '2026-02-20 14:02:27', '2026-01-21 14:02:27', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(98, 1, 'f446ccd8b1cc2d3bfd4792f89a36639ba3bfecf16c160d34863e3ce051801440', '2026-01-21 08:32:27', '2026-02-20 14:02:27', '2026-01-21 14:02:32', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(99, 1, '099fc5ce6ee0313b8dac8e297d1a501929476f57a41b9f757e864d42bd82aeb1', '2026-01-21 08:32:32', '2026-02-20 14:02:32', '2026-01-21 14:04:35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(100, 1, '6977ddf3d7a5fa96888b9c0b27f83d9e987cfb7ed053f184d80e68bc41df2130', '2026-01-21 08:34:35', '2026-02-20 14:04:35', '2026-01-21 14:07:15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(101, 1, '2db23609ccce0fb421b2af250b0776576a551645ef57a685e0608b542eedbb35', '2026-01-21 08:37:15', '2026-02-20 14:07:15', '2026-01-21 14:12:48', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(102, 1, '35d2fad7a1df6152efe98caf5ff4cfbbe6ebc862b440fa8e1c8238866be11349', '2026-01-21 08:40:21', '2026-02-20 14:10:21', NULL, 'PostmanRuntime/7.51.0', '::1'),
(103, 1, 'cf5a01ccaae67225910464dc6aeac7f72f0999764f7474f897033261093de717', '2026-01-21 08:42:48', '2026-02-20 14:12:48', '2026-01-21 14:12:57', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(104, 1, '2057bc77020b873c9ba426160f23dff610706e5183bd95cef25d9493fcce1b3b', '2026-01-21 08:42:57', '2026-02-20 14:12:57', '2026-01-21 14:16:40', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(105, 1, '3f27c0d59e269ea1b4fd18436a172cbe37389670a5cea3ef2168deff207c43a7', '2026-01-21 08:46:40', '2026-02-20 14:16:40', '2026-01-21 14:18:54', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(106, 1, 'cb35d7d0ea5befac9e09e311cbb70390bd4464f8786919fb20bce828fe201b88', '2026-01-21 08:48:54', '2026-02-20 14:18:54', '2026-01-21 14:19:51', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(107, 1, 'fb8f15dcb6e0a324c08d88c951568175429f9c3f85489f35bebe0da455f20380', '2026-01-21 08:49:51', '2026-02-20 14:19:51', '2026-01-21 14:20:55', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(108, 1, 'd9ee55b86c859968ef17b5117f5815acd8f15b5fd32e15e515a2879c84eaa29d', '2026-01-21 08:50:55', '2026-02-20 14:20:55', '2026-01-21 14:20:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(109, 1, '867f81e0c88cdc1dd14dca4512f5c45f8811dbd05f57fd2132f83eef4407aad6', '2026-01-21 08:50:56', '2026-02-20 14:20:56', '2026-01-21 14:20:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(110, 1, '867f81e0c88cdc1dd14dca4512f5c45f8811dbd05f57fd2132f83eef4407aad6', '2026-01-21 08:50:56', '2026-02-20 14:20:56', '2026-01-21 14:20:58', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(111, 1, 'e8307c9b3b3255ca627fdd2b6cd5450910c90157d8f8e7e5a8693a6d77313a84', '2026-01-21 08:50:58', '2026-02-20 14:20:58', '2026-01-21 14:21:09', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(112, 1, '98987f17bb8b05522a2c85b42e445e6e841a6b6fea3d8f20a968901d0292c5e3', '2026-01-21 08:51:09', '2026-02-20 14:21:09', '2026-01-21 14:29:09', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(113, 1, '883e1508917e6e88aa38e59792d699eea8f689948a5ab49800409c9e17014390', '2026-01-21 08:59:09', '2026-02-20 14:29:09', '2026-01-21 14:38:38', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(114, 1, 'b70160e158b1c19f5c3c3066732bcc599e1563240c9d87ba76d7651b038c0e57', '2026-01-21 09:08:38', '2026-02-20 14:38:38', '2026-01-21 14:51:53', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(115, 1, 'b38d9d4e14308bbf5d119d23ea36575d26065cc618cd1377e1019e587e241278', '2026-01-21 09:21:53', '2026-02-20 14:51:53', '2026-01-21 14:53:03', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(116, 1, 'a7d2c318f53ecbf706bf864201e263ecff5518495b2fd6513310cda1301d3342', '2026-01-21 09:23:03', '2026-02-20 14:53:03', '2026-01-21 14:59:26', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(117, 1, 'd08c7e8f2dc11dbbec20453dc5cdf86f3319d11e88ae18798c431451274f7e93', '2026-01-21 09:29:26', '2026-02-20 14:59:26', '2026-01-21 15:00:20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(118, 1, 'f617e956a93e940d5abd1d274c1d41f836acecc2f737cf762c983e64b4b03a8f', '2026-01-21 09:30:20', '2026-02-20 15:00:20', '2026-01-21 15:11:02', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(119, 1, '82136bf4d6492bec126307ceb579ab640e56986f4f8b9f3c438ab9c1fac044d8', '2026-01-21 09:41:02', '2026-02-20 15:11:02', '2026-01-21 15:12:13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(120, 1, '82136bf4d6492bec126307ceb579ab640e56986f4f8b9f3c438ab9c1fac044d8', '2026-01-21 09:41:02', '2026-02-20 15:11:02', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(121, 1, '82136bf4d6492bec126307ceb579ab640e56986f4f8b9f3c438ab9c1fac044d8', '2026-01-21 09:41:02', '2026-02-20 15:11:02', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(122, 1, '82136bf4d6492bec126307ceb579ab640e56986f4f8b9f3c438ab9c1fac044d8', '2026-01-21 09:41:02', '2026-02-20 15:11:02', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(123, 1, '0603f812ed283467a87e4b030b02c484981dbed7a4acafab7f9168db8222c804', '2026-01-21 09:42:13', '2026-02-20 15:12:13', '2026-01-21 15:13:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(124, 1, 'b860f836974032b013956696184c351b01b4158b6c5fafaa6c7e7fa648537299', '2026-01-21 09:43:12', '2026-02-20 15:13:12', '2026-01-21 15:13:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(125, 1, 'b860f836974032b013956696184c351b01b4158b6c5fafaa6c7e7fa648537299', '2026-01-21 09:43:12', '2026-02-20 15:13:12', '2026-01-21 15:13:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(126, 1, 'b860f836974032b013956696184c351b01b4158b6c5fafaa6c7e7fa648537299', '2026-01-21 09:43:12', '2026-02-20 15:13:12', '2026-01-21 15:13:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(127, 1, 'd8ecf8a425126bd0cd182c49d20724ebfd17d7da8ad6d000f0a95de04b2ad7e5', '2026-01-21 09:43:16', '2026-02-20 15:13:16', '2026-01-21 15:13:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(128, 1, 'd8ecf8a425126bd0cd182c49d20724ebfd17d7da8ad6d000f0a95de04b2ad7e5', '2026-01-21 09:43:16', '2026-02-20 15:13:16', '2026-01-21 15:13:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(129, 1, 'd8ecf8a425126bd0cd182c49d20724ebfd17d7da8ad6d000f0a95de04b2ad7e5', '2026-01-21 09:43:16', '2026-02-20 15:13:16', '2026-01-21 15:17:18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(130, 1, 'e3841350482a1a319bb2adf2172dd7c8f6c7e77119f62947177a09f1f93c78b6', '2026-01-21 09:47:18', '2026-02-20 15:17:18', '2026-01-21 15:17:32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(131, 1, 'b18350b6f9f92b1ea3d90e05d970fbcc4f3b2ede843b655c427372af4056558e', '2026-01-21 09:47:32', '2026-02-20 15:17:32', '2026-01-21 15:29:02', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(132, 1, 'a56810451d4711c4d9236b2cbdefa32be4933322330d77eacbb28df09300b177', '2026-01-21 09:59:02', '2026-02-20 15:29:02', '2026-01-21 15:29:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(133, 1, '90f41bd3bcd870e50d2158741c64acd3018071b5e5ef47d2c39207a152c6aa7c', '2026-01-21 09:59:16', '2026-02-20 15:29:16', '2026-01-21 15:35:27', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(134, 1, '642b7674e9bd1a591b052fd9a4a3019c3805e5a5b62fba56bd29bfe39f7c9e70', '2026-01-21 10:05:27', '2026-02-20 15:35:27', '2026-01-21 16:00:27', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(135, 1, 'b21ca351e12f52f9344ebee162bae232b8296f490fb5a0dece9077b9cba6ba42', '2026-01-21 10:30:27', '2026-02-20 16:00:27', '2026-01-21 16:00:28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(136, 1, 'b21ca351e12f52f9344ebee162bae232b8296f490fb5a0dece9077b9cba6ba42', '2026-01-21 10:30:27', '2026-02-20 16:00:27', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(137, 1, 'b21ca351e12f52f9344ebee162bae232b8296f490fb5a0dece9077b9cba6ba42', '2026-01-21 10:30:27', '2026-02-20 16:00:27', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(138, 1, 'b21ca351e12f52f9344ebee162bae232b8296f490fb5a0dece9077b9cba6ba42', '2026-01-21 10:30:27', '2026-02-20 16:00:27', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(139, 1, 'a0174e7c3edc2802bbf17b7550afdf5763a99c382fe8185230e5d9cfe9631b21', '2026-01-21 10:30:28', '2026-02-20 16:00:28', '2026-01-21 16:00:28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(140, 1, 'a0174e7c3edc2802bbf17b7550afdf5763a99c382fe8185230e5d9cfe9631b21', '2026-01-21 10:30:28', '2026-02-20 16:00:28', '2026-01-21 16:17:34', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(141, 1, 'a0174e7c3edc2802bbf17b7550afdf5763a99c382fe8185230e5d9cfe9631b21', '2026-01-21 10:30:28', '2026-02-20 16:00:28', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(142, 1, '7316c709973760c1a94cee7bc0841484599b3eaf3d0169a7ed3cf987fd2b5ee8', '2026-01-21 10:47:34', '2026-02-20 16:17:34', '2026-01-21 16:30:44', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(143, 1, '2e361cc1b35c22da2b5b32641006a4e8fa48ba75ca179f0aa668444ea7edc276', '2026-01-21 11:00:44', '2026-02-20 16:30:44', '2026-01-21 16:34:36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(144, 1, '2e361cc1b35c22da2b5b32641006a4e8fa48ba75ca179f0aa668444ea7edc276', '2026-01-21 11:00:44', '2026-02-20 16:30:44', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(145, 1, 'f3842ad24f63d80c8fd488aa839699a49dba31f94eb0326909af3ea6aad750a5', '2026-01-21 11:04:36', '2026-02-20 16:34:36', '2026-01-21 16:50:11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(146, 1, 'f6c50cedd127386e86f8082289c56599b520f835b68026fb4226e44322454a42', '2026-01-21 11:20:11', '2026-02-20 16:50:11', '2026-01-21 16:51:02', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(147, 1, 'f6c50cedd127386e86f8082289c56599b520f835b68026fb4226e44322454a42', '2026-01-21 11:20:11', '2026-02-20 16:50:11', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(148, 1, 'd7b585c279cd7aea5db91a65143c3583f158776d5711feccdcb18ea9554a7007', '2026-01-21 11:21:02', '2026-02-20 16:51:02', '2026-01-21 16:51:24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(149, 1, 'a142c8a2d291835577773e2873c27150f2cc364a1e96fac4a2d329fe8704ebd3', '2026-01-21 11:21:24', '2026-02-20 16:51:24', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(150, 1, 'a861bc4c82151773064778f501f0d8e6fc188beed9582ad8c2bc8c801ed3805b', '2026-01-22 05:40:17', '2026-02-21 11:10:17', '2026-01-22 11:27:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(151, 1, '907ee2dfe0f61707ae8183f05fd9dff480ff3ff191832a4fd2114124db179869', '2026-01-22 05:46:42', '2026-02-21 11:16:42', NULL, 'PostmanRuntime/7.51.0', '::1'),
(152, 1, 'e8c0d0e4c4b09e333900e599a1370e2d81bb97e33b2824a0b10517f9c601b55e', '2026-01-22 05:57:12', '2026-02-21 11:27:12', '2026-01-22 11:59:43', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(153, 1, '937be67fe0c0b412c82d82c0b48de552d76fadaf474eb7ad48f6f8ba50c228b4', '2026-01-22 06:29:43', '2026-02-21 11:59:43', '2026-01-22 11:59:47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(154, 1, '36f9a3f837391e02e9cbd8b6160a55bc21a2042c040c7039847f69f1810b299c', '2026-01-22 06:29:47', '2026-02-21 11:59:47', '2026-01-22 11:59:51', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(155, 1, '7caf34dc214e80a1a5dd74568b62208cc75e711d6e9c4830639a20e6eaf4a68f', '2026-01-22 06:29:51', '2026-02-21 11:59:51', '2026-01-22 11:59:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(156, 1, '2af82fd0638db9770e4e87c256c02fc1502a09bc58ce20439cc286209494c3c5', '2026-01-22 06:29:56', '2026-02-21 11:59:56', '2026-01-22 12:01:26', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(157, 1, '7ce052f2d5bb4ef9ac328dde7d91047785c7d71a8fb1584e21482ea3980723d8', '2026-01-22 06:31:26', '2026-02-21 12:01:26', '2026-01-22 12:03:00', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(158, 1, 'a3bedacbc82a48def4430a1110bda8b65739a3ed0a7c15141615b1a4345ab058', '2026-01-22 06:33:00', '2026-02-21 12:03:00', '2026-01-22 12:17:44', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(159, 1, '31ec85944bbecefe7626888d28da0a2e7665d06718e7e9dc0655a4be8d9fa619', '2026-01-22 06:47:44', '2026-02-21 12:17:44', '2026-01-22 12:19:31', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(160, 1, 'ac4e603d47b390334210fd6098482a0ec546b0f8fe754085933ad8277fc24ae5', '2026-01-22 06:49:31', '2026-02-21 12:19:31', '2026-01-22 12:19:42', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(161, 1, '7eb42b1169e82a675a5417f9909795c1141c6c1a0ddeb791c1648bb384d40f29', '2026-01-22 06:49:42', '2026-02-21 12:19:42', '2026-01-22 12:21:11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(162, 1, '0bcbe35847f60e09e24f97026cfa98c394198101e92e66f42a09b974300a36f4', '2026-01-22 06:51:11', '2026-02-21 12:21:11', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(163, 1, '16a5d3a4c531663df2f58fa747d1905ab65e0f32634c59713618084ff70b3cd9', '2026-01-22 06:53:19', '2026-02-21 12:23:19', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(164, 1, '0fe57ce48fd95079421725cc93fa3d52ed6ba00022fc44e57fcf97b9aea8f294', '2026-01-22 06:55:47', '2026-02-21 12:25:47', '2026-01-22 12:25:51', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(165, 1, 'b4227f3dcafab5567be92f8436072a2f9e25da59d8397f9414b30612743a6d10', '2026-01-22 06:55:51', '2026-02-21 12:25:51', '2026-01-22 12:27:15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(166, 1, '4c36cb8670169ab45c678f9aac2e716831cbaeaf902a0b1db92795f460ed06e1', '2026-01-22 06:57:15', '2026-02-21 12:27:15', '2026-01-22 12:29:36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(167, 1, '06a841cef0991da3e95920033f40a04df6f557b10d1c9fd1af9f87d4d04930a6', '2026-01-22 06:59:36', '2026-02-21 12:29:36', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(168, 1, 'a751b27199c60c7a270d041926ef25450bd329c2afab7c8d2d10c7d9f8623247', '2026-01-22 07:02:12', '2026-02-21 12:32:12', '2026-01-22 12:33:42', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(169, 1, 'a31235a94fb3275aa7d5b3bdc972f1cec358c09266253a3e2193addf6b1f6028', '2026-01-22 07:03:42', '2026-02-21 12:33:42', '2026-01-22 13:44:33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(170, 1, 'c3b6a7d546b9fbbe6da0b48368d5a8ff31496516e4568a0d1436cb0e6124b4d8', '2026-01-22 07:19:01', '2026-02-21 12:49:01', '2026-01-22 13:05:14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(171, 1, '5cb18317bbe740cfcda5201813ff06423c93c650706ace10ab3f190f33332006', '2026-01-22 07:35:14', '2026-02-21 13:05:14', '2026-01-22 13:32:22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(172, 1, 'c9ff7fb672e91672bdc1d7c2c8be1ed81a3518b5d70bd6988b4932c15f12bc8d', '2026-01-22 08:02:22', '2026-02-21 13:32:22', '2026-01-22 13:40:00', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(173, 1, 'fdeed8b37f45f497fbfb13944379d1ba89e0ebe7f8a2ae968923d073311d164e', '2026-01-22 08:10:00', '2026-02-21 13:40:00', '2026-01-22 13:44:13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(174, 1, '2cb2508e942c644966ffc48c1d000ceb433c74edb5335dc5f0d1b2d5788adc16', '2026-01-22 08:14:13', '2026-02-21 13:44:13', '2026-01-22 13:52:48', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(175, 1, 'c5a9c3937969d602bf1a9cd160268a0d61c29e714ae40db0cb3fe521076b1bf1', '2026-01-22 08:14:33', '2026-02-21 13:44:33', '2026-01-22 13:59:53', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(176, 1, 'c5a9c3937969d602bf1a9cd160268a0d61c29e714ae40db0cb3fe521076b1bf1', '2026-01-22 08:14:33', '2026-02-21 13:44:33', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(177, 1, 'c5a9c3937969d602bf1a9cd160268a0d61c29e714ae40db0cb3fe521076b1bf1', '2026-01-22 08:14:33', '2026-02-21 13:44:33', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(178, 1, 'dd5d09d57e42a8a6475fc464b3faa15b1ab4a5f74b8f7325215356cc30681e19', '2026-01-22 08:22:48', '2026-02-21 13:52:48', '2026-01-22 13:59:47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(179, 1, 'b1ba20d60e8939684ce2d50fea71cb35208d33d7d7c78bdd044c3a26919ac14e', '2026-01-22 08:29:47', '2026-02-21 13:59:47', '2026-01-22 13:59:51', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(180, 1, 'd3d4903d450c256568eff4863a76a6457259106fb6e2c9272659e396b37823f4', '2026-01-22 08:29:51', '2026-02-21 13:59:51', '2026-01-22 14:08:31', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(181, 1, '5beaea1beaf7953abaade4030f1cc90a249a4795511994aa8e73841b3e2a0ba2', '2026-01-22 08:29:53', '2026-02-21 13:59:53', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(182, 1, 'a4d9307f7fcddd9b1a1f4192665da148ff36a2d1f3dc3f9b2da02917e0cd3b94', '2026-01-22 08:33:22', '2026-02-21 14:03:22', NULL, 'PostmanRuntime/7.51.0', '::1'),
(183, 1, '647cde3e5d3db9245d848a977baddc6679463693f774ad92954d842522dafd1c', '2026-01-22 08:38:31', '2026-02-21 14:08:31', '2026-01-22 14:08:44', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(184, 1, 'de70c0f00d5e69df771c541dac2f97a2bb897a23dd4f81008f4b50f4f49473d7', '2026-01-22 08:38:44', '2026-02-21 14:08:44', '2026-01-22 14:08:54', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(185, 1, '8a04fabfbf4facfa8e3b8bd1b7416ec87d8e421180d6b51cefb7a383b36cb89f', '2026-01-22 08:38:54', '2026-02-21 14:08:54', '2026-01-22 14:09:21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(186, 1, 'cd887c8a328668425aecad3ab6ade4911a933f9ec2f921a5195a0ee6330b76a0', '2026-01-22 08:39:21', '2026-02-21 14:09:21', '2026-01-22 14:10:13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(187, 1, '8f0ca61fcfa97a55caa16804c952149365b2f5b236ba9bdd9b06231939fdd5e7', '2026-01-22 08:40:13', '2026-02-21 14:10:13', '2026-01-22 14:13:49', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(188, 1, '32b0363ce2cc268ad88e29520b8cd2d9f0f9bc01e5f28b54c574add9a3df80ce', '2026-01-22 08:43:49', '2026-02-21 14:13:49', '2026-01-22 14:15:58', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(189, 1, '3641c6a41056d2715eee3e08f2122368a0042da75a605e324cd5d4aac6f59a88', '2026-01-22 08:45:58', '2026-02-21 14:15:58', '2026-01-22 14:16:10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(190, 1, '1ee712579a81c8d568483b3e17b56c70e6eb1d065fb4124f90408a603bc15013', '2026-01-22 08:46:10', '2026-02-21 14:16:10', '2026-01-22 14:16:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(191, 1, '66a2170f6a95dced97be632a31a419a80204c94e9c768ce8ec2128e0b5d7121e', '2026-01-22 08:46:12', '2026-02-21 14:16:12', '2026-01-22 14:21:26', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(192, 1, 'fa423ea996af1a7b513bcf0ecdafbc8e3d27b7b5461129b3cff9eaa66723b1e8', '2026-01-22 08:51:26', '2026-02-21 14:21:26', '2026-01-22 14:21:33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1');
INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`, `user_agent`, `ip`) VALUES
(193, 1, '9fff2eb759d0045ffe2509470d813a1feb78165a1b386cff03e78c468e0bfa2d', '2026-01-22 08:51:33', '2026-02-21 14:21:33', '2026-01-22 14:21:41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(194, 1, 'e7c2b20027b90883d1728693556bb03fda8ee2726f2626467bd8a072b684d608', '2026-01-22 08:51:41', '2026-02-21 14:21:41', '2026-01-22 14:26:34', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(195, 1, 'a377194c95a9476be0c8d050ab8a5cb39e5d4b5a9c4940106a8469ed08a77741', '2026-01-22 08:56:34', '2026-02-21 14:26:34', '2026-01-22 14:26:37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(196, 1, 'ca0227a76965e244ec907761a26481f9e46f8c2635846b69b4bba4c6d425709b', '2026-01-22 08:56:37', '2026-02-21 14:26:37', '2026-01-22 14:26:54', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(197, 1, '6ad7d84ea678d148b0565aa9122bef4b7d5be7c303885f4541a93a04acde01c2', '2026-01-22 08:56:54', '2026-02-21 14:26:54', '2026-01-22 14:27:39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(198, 1, '0fe0894b968386c7fd1247788cec22c96841f311a8320a9dbc7b905ad32016bc', '2026-01-22 08:57:39', '2026-02-21 14:27:39', '2026-01-22 14:27:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(199, 1, '535c86e66732d24ee68e77dee76682a8e8d7f02cbb7473db433d2d97fc12f92d', '2026-01-22 08:57:56', '2026-02-21 14:27:56', '2026-01-22 14:29:52', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(200, 1, 'ca7637be594cf5bedd6e7d63faf7e002887bdff34c4dfe13eea522114a302b62', '2026-01-22 08:59:52', '2026-02-21 14:29:52', '2026-01-22 14:29:55', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(201, 1, '8e0ea6c7184cb303a9ff98b400320de08dce12d172c1f3d3c23e9921e2a274c9', '2026-01-22 08:59:55', '2026-02-21 14:29:55', '2026-01-22 14:30:06', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(202, 1, '2e37ffed9625dad5506b4d1b690466ffe5071ad67dc466a45be6a0367af4257c', '2026-01-22 09:00:06', '2026-02-21 14:30:06', '2026-01-22 14:30:10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(203, 1, '8e215a00325782ade092e3dffe5c4887f4dc0c3f9e1291c4424ff5cc37ad0a9c', '2026-01-22 09:00:10', '2026-02-21 14:30:10', '2026-01-22 14:34:24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(204, 1, 'bb359bec0ee5751d19e6ce4add4aca93e77004404b47e70432f2093bcb078ac0', '2026-01-22 09:01:26', '2026-02-21 14:31:26', NULL, 'PostmanRuntime/7.51.0', '::1'),
(205, 1, '48202368e054b1cca2143006a4630efed39b2263c867347fc055d99a731f6b1c', '2026-01-22 09:04:24', '2026-02-21 14:34:24', '2026-01-22 14:49:50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(206, 1, '28b01cd60643b914215ba754e8b8496cd30adc30c9f57ea2d9e069ccc2273f74', '2026-01-22 09:19:50', '2026-02-21 14:49:50', '2026-01-22 15:15:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(207, 1, '28b01cd60643b914215ba754e8b8496cd30adc30c9f57ea2d9e069ccc2273f74', '2026-01-22 09:19:50', '2026-02-21 14:49:50', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(208, 1, '675e638d0464715f69fb2d4b5ffac1cf5e4c856553e2ca524ba5735fcb884256', '2026-01-22 09:45:16', '2026-02-21 15:15:16', '2026-01-22 15:31:50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(209, 1, '6563fb56495ae6aceacb690be242b1262cefe1f6a13e356df7687ed85fb5ff01', '2026-01-22 10:01:50', '2026-02-21 15:31:50', '2026-01-22 15:35:41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(210, 1, '15a5cdbe61dc04e5cbf17b1079b475add5e91ae4e04f4064443cf3a01766c734', '2026-01-22 10:05:41', '2026-02-21 15:35:41', '2026-01-22 15:39:44', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(211, 1, '9d64aa9da69019c0cc4992df5bad204da33377eadea4bfefd9001ca7a8068292', '2026-01-22 10:09:44', '2026-02-21 15:39:44', '2026-01-22 15:40:20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(212, 1, '68567543746da1248256859a8d419b0895be73d29a6ac11c71a851f78434cd50', '2026-01-22 10:10:20', '2026-02-21 15:40:20', '2026-01-22 16:01:00', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(213, 1, '287c4e6e3ff96e88f57c24dc24b12afcb1d0536a0f1912470e9a21964744472b', '2026-01-22 10:31:00', '2026-02-21 16:01:00', '2026-01-22 16:05:19', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(214, 1, '59abcab7ca6a4c8f7596c0100948fc4b33349ad490aca2cc86578e76aa60e780', '2026-01-22 10:35:19', '2026-02-21 16:05:19', '2026-01-22 16:09:30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(215, 1, 'eaae9504ead073f3d4a803ac5bbd7e6d64b4d73efe49f85df8f42acee93fd4db', '2026-01-22 10:39:30', '2026-02-21 16:09:30', '2026-01-22 16:09:38', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(216, 1, 'e330cc0856312ae5d5318894841e6b720a96bb25548e335c59a56132990a68d3', '2026-01-22 10:39:38', '2026-02-21 16:09:38', '2026-01-22 16:10:23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(217, 1, 'a29a7604b54b254ad97585beb0112d1d310a7959e26f1a59bdf4f14d715ac88b', '2026-01-22 10:40:23', '2026-02-21 16:10:23', '2026-01-22 16:11:25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(218, 1, 'e3b8ad8874d279e8df55fd5f40686058f6fb73330ac8f4d5b077d9b503baadfe', '2026-01-22 10:41:25', '2026-02-21 16:11:25', '2026-01-22 16:12:05', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(219, 1, '8791f1ea68a014d8052c901d5b477939d294cb8e78d333a1a5e0996d75c2d315', '2026-01-22 10:42:05', '2026-02-21 16:12:05', '2026-01-22 16:13:50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(220, 1, '601ee28cee7250fd3a55aeed3a3b6f9422909f1c1fb0f7ab2e9c19509751e9ac', '2026-01-22 10:43:50', '2026-02-21 16:13:50', '2026-01-22 16:16:10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(221, 1, 'ccd143bce5f5b1cde21d31e00f2dd33673af6e8357c67ec76d081d2c7cf2fb8b', '2026-01-22 10:46:10', '2026-02-21 16:16:10', '2026-01-22 16:22:29', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(222, 1, 'e35c681783cf64f6101b5018c07d3637a3cf4ec70282e79db9968a51484e4950', '2026-01-22 10:52:29', '2026-02-21 16:22:29', '2026-01-22 16:22:37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(223, 1, '08dfceb683f5cd98b2481379c5daa93bfe231ee78da120743550af8b51b6b5ba', '2026-01-22 10:52:37', '2026-02-21 16:22:37', '2026-01-22 16:22:38', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(224, 1, 'bb52d77789cb505db37d5e9602818d767f93d91e3fdb90bbf72142b4070ed7b5', '2026-01-22 10:52:38', '2026-02-21 16:22:38', '2026-01-22 16:22:38', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(225, 1, 'bb52d77789cb505db37d5e9602818d767f93d91e3fdb90bbf72142b4070ed7b5', '2026-01-22 10:52:38', '2026-02-21 16:22:38', '2026-01-22 16:22:38', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(226, 1, 'bb52d77789cb505db37d5e9602818d767f93d91e3fdb90bbf72142b4070ed7b5', '2026-01-22 10:52:38', '2026-02-21 16:22:38', '2026-01-22 16:23:42', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(227, 1, '8a3c9872a4cd02288410accf422165898bf106e73388287c09422e7b389b6472', '2026-01-22 10:53:42', '2026-02-21 16:23:42', '2026-01-22 16:24:40', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(228, 1, '4cb0a328c9940766392ed5247f76300cf9b571cbd7151e4a2580e7bf0bd50f07', '2026-01-22 10:54:40', '2026-02-21 16:24:40', '2026-01-22 16:30:23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(229, 1, '35d0b9f13603c8d9eed017c5c838a44d3dc05aa5c0598866d77d8398c7df7d6e', '2026-01-22 11:00:23', '2026-02-21 16:30:23', '2026-01-22 16:50:37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(230, 1, '052ab67acaf4ac481df64a092365e4d1cebea422ac29df104000ecd31390460e', '2026-01-22 11:20:37', '2026-02-21 16:50:37', '2026-01-22 17:00:19', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(231, 1, '5cf5a5f4b94cdef35353b12cf22811df1dfa9460ef97ae4179f4ed6fa021a24f', '2026-01-22 11:30:19', '2026-02-21 17:00:19', '2026-01-22 17:05:09', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(232, 1, '0ede0023ad142b0f6a8b887c3519feb9902fd5d4bfea3004f42a0d159f94c778', '2026-01-22 11:35:09', '2026-02-21 17:05:09', '2026-01-22 17:09:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(233, 1, 'db55020037bd5c94acd2e9ed73da6e20c995bb98e8ac020ec14f7c041e3e3c71', '2026-01-22 11:39:56', '2026-02-21 17:09:56', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(234, 1, '1ed52f98989613235d52dad7581cf7794994a57f1b0626ef8ddd09bc2e5ccf81', '2026-01-23 04:10:24', '2026-02-22 09:40:24', '2026-01-23 09:40:27', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(235, 1, '8b0bf625285a85dc5188576ab39f96121e088914cdb40844e6333b2859bdcb69', '2026-01-23 04:10:27', '2026-02-22 09:40:27', '2026-01-23 10:05:22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(236, 1, '8c9df6d93ec696d2600641a9b4b17bc20145a4e132237a61078c708fbf89f2b7', '2026-01-23 04:35:22', '2026-02-22 10:05:22', '2026-01-23 10:08:24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(237, 1, '8c9df6d93ec696d2600641a9b4b17bc20145a4e132237a61078c708fbf89f2b7', '2026-01-23 04:35:22', '2026-02-22 10:05:22', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(238, 1, '0dd87fc288e2919bec667c9f69387c1d5faae199c9a797c2eaeb81f21c59fe1c', '2026-01-23 04:38:25', '2026-02-22 10:08:25', '2026-01-23 10:14:33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(239, 1, '351f3b47c2483cd0598bc841722793b18d58e843f63926ff5ead4c6b187eeb2c', '2026-01-23 04:44:33', '2026-02-22 10:14:33', '2026-01-23 10:16:05', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(240, 1, '9f37a155fc14a8ee9caa37942399dbd68f7d9462df681f7cecb35d00d9940f81', '2026-01-23 04:46:05', '2026-02-22 10:16:05', '2026-01-23 10:27:58', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(241, 1, 'a9aecb0009a9f89c63e867062d07ac6972ac3c1d4dac37ac4919fd5905f482c3', '2026-01-23 04:57:58', '2026-02-22 10:27:58', '2026-01-23 10:29:23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(242, 1, '13e885bf5dcb2f498279e1fe36d9f33e145ee7dce142822ca02dc47f6fb135fa', '2026-01-23 04:59:23', '2026-02-22 10:29:23', '2026-01-23 10:38:18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(243, 1, '839220fb103ef4decbfb29f4ddfce517019be444c53ed02c7db7286ba75c9356', '2026-01-23 05:08:18', '2026-02-22 10:38:18', '2026-01-23 10:40:28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(244, 1, '510d044fa7ab7871f2467309ca50705d8c892016a06d418bc02362e509482d73', '2026-01-23 05:10:28', '2026-02-22 10:40:28', '2026-01-23 10:42:37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(245, 1, '477590719b0d1b8b20a340a07d6d863818f9b4bbc81df052e11681c14835d2a1', '2026-01-23 05:12:37', '2026-02-22 10:42:37', '2026-01-23 10:44:14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(246, 1, '262b3b75714cc1323774d341eb4c19d42ba1c39d932d8ea5d5c1da177a9abc3b', '2026-01-23 05:14:14', '2026-02-22 10:44:14', '2026-01-23 10:59:50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(247, 1, '0ef3c5d41534a8ac0a3358da602f8eef4acde9f9287509e404abc834064879ad', '2026-01-23 05:29:50', '2026-02-22 10:59:50', '2026-01-23 11:07:34', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(248, 1, 'e7378a1eb9c800a4d3335b57fb0d61e91eaed03a462bb44463071274f66bd5e4', '2026-01-23 05:37:34', '2026-02-22 11:07:34', '2026-01-23 11:10:17', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(249, 1, '8ef79da76194053a2cd97f11699f990395a090b3c8cf018ccf2cf4c49ccef014', '2026-01-23 05:40:17', '2026-02-22 11:10:17', '2026-01-23 11:20:20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(250, 1, 'd49604024cc19f2efd0ce040cae1575a68f4001d25a53b7fbb4c41540a8dc061', '2026-01-23 05:50:20', '2026-02-22 11:20:20', '2026-01-23 11:21:39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(251, 1, '55ae1e2ecb27e5153fe469b3232ff9185d1bc074343f4f974f534f26386511da', '2026-01-23 05:51:39', '2026-02-22 11:21:39', '2026-01-23 11:36:03', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(252, 1, 'd691110873c655f9ef3901fe09649799d6a5b6a2998ff69f0045cc20a0b4cb47', '2026-01-23 06:06:03', '2026-02-22 11:36:03', '2026-01-23 11:36:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(253, 1, 'ef54b42b2d636bc763c0007d120d3268afaff43de0425ae64cf46bd74f1a31d5', '2026-01-23 06:06:56', '2026-02-22 11:36:56', '2026-01-23 11:42:52', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(254, 1, 'f75aaa843f7773128936b65b06204f3f08b560ec9b633f08b77b5fa88991a7dd', '2026-01-23 06:12:52', '2026-02-22 11:42:52', '2026-01-23 11:45:20', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(255, 1, '061f1da009b71b4f2853b5032ce6b3996bb367af8d6f6a3144cc15c285817f27', '2026-01-23 06:15:20', '2026-02-22 11:45:20', '2026-01-23 11:48:45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(256, 1, '34b96eca9caa89e077706e23164e7a25007ff07c9234d9e895c1ce11d9bf1e93', '2026-01-23 06:18:45', '2026-02-22 11:48:45', '2026-01-23 11:51:20', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(257, 1, '2d8ae68a0382eb342b7c0437ef574378fbcc618cf31b2a56daf0f735c05c0e64', '2026-01-23 06:21:20', '2026-02-22 11:51:20', '2026-01-23 11:51:26', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(258, 1, 'cabf4b1453e39a5935953e9ccb393d741106ee193570cf92d8736114df22e1a9', '2026-01-23 06:21:26', '2026-02-22 11:51:26', '2026-01-23 11:56:52', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(259, 1, '08deb3f0288b083a3a3cafc5cdaf2618c2a1a32b908bd5b0ed7def9b2acd1e1f', '2026-01-23 06:26:52', '2026-02-22 11:56:52', '2026-01-23 12:03:54', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(260, 1, 'dc6bd1b4699d72619eeda94d0cb8ace452e0a1f4b0aca263751e06e63b454b7c', '2026-01-23 06:33:54', '2026-02-22 12:03:54', '2026-01-23 12:04:04', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(261, 1, 'd6f5f41c8312395a7bca42b75c022bc71ae7698d1b47858a8bc14b51cb470a34', '2026-01-23 06:34:04', '2026-02-22 12:04:04', '2026-01-23 12:07:29', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(262, 1, '78c3a0a7326dbd6049e39a5264c036aeb15d0a994ffcc2349ad327a45501f828', '2026-01-23 06:37:29', '2026-02-22 12:07:29', '2026-01-23 12:09:55', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(263, 1, '122a36a57c40bbd2bbe9be625b8f191ec453f2bb33ef59e5d60692f56468793c', '2026-01-23 06:39:55', '2026-02-22 12:09:55', '2026-01-23 12:10:01', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(264, 1, 'be6ede904137b54eac3626e69b0de24070b6ab57db645ba0523a0e4c723aefea', '2026-01-23 06:40:01', '2026-02-22 12:10:01', '2026-01-23 12:10:13', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(265, 1, 'edf3fdd6599d23f8e419fb97a08252060997f009390950cdf55b48426c93a685', '2026-01-23 06:40:13', '2026-02-22 12:10:13', '2026-01-23 12:10:42', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(266, 1, '4dc661d1ade86bc271b880181fde75a124d5ab231991358fc6d55a72a311978b', '2026-01-23 06:40:42', '2026-02-22 12:10:42', '2026-01-23 12:11:02', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(267, 1, '8c75b6256259b39d22a56fd0ed6ae1d6e648aecf6727e3e4ed1d130d75806f53', '2026-01-23 06:41:02', '2026-02-22 12:11:02', '2026-01-23 12:17:39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(268, 1, '60b3aeb5836ea9b5daace7ff243ded1b21b7b062e5dd4b5f617577762666e3fd', '2026-01-23 06:47:39', '2026-02-22 12:17:39', '2026-01-23 12:18:53', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(269, 1, 'b7a2e7d23f6be37163fdc90555f83c95ca069393cd18cb1e1b3c5f3efe2bee55', '2026-01-23 06:48:53', '2026-02-22 12:18:53', '2026-01-23 12:27:14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(270, 1, '743848a905ee36171faf56bce5c046cb8ab47fe5148584bd40d0e3180fcb3625', '2026-01-23 06:57:14', '2026-02-22 12:27:14', '2026-01-23 12:27:24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(271, 1, '32f95c09d3ce924f7931df52bf512d8741c35538116676cf2c7d62264980ae27', '2026-01-23 06:57:24', '2026-02-22 12:27:24', '2026-01-23 12:30:09', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(272, 1, 'dcdb8c0ddb4e30025dd990132cdd1408095f17f770c05a2e49a0415714a67036', '2026-01-23 07:00:09', '2026-02-22 12:30:09', '2026-01-23 13:04:12', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(273, 1, '83d1643702d50a31b6092a0bf78eef02b5d9c65c83390d867955ec3057296b3a', '2026-01-23 07:34:12', '2026-02-22 13:04:12', '2026-01-23 13:04:20', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(274, 1, '6be6000ebfc753f86f7ae6621e2455a70c1dc790ffbb7f4fb4e8fcf332a2ddd5', '2026-01-23 07:34:20', '2026-02-22 13:04:20', '2026-01-23 13:04:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(275, 1, 'f200c1a0fd5397e66623de0013f703ba001f65ea0b756e7668506425497b022f', '2026-01-23 07:34:56', '2026-02-22 13:04:56', '2026-01-23 13:05:05', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '::1'),
(276, 1, '28cf51c2ed0c5df89f068534d04e28d7afff2e53cbf9348006f2d4ec3ca4f141', '2026-01-23 07:35:05', '2026-02-22 13:05:05', '2026-01-23 13:14:05', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(277, 1, 'a3bbcd547a60f3a4bf0c1bf4ee9cf4ba161506ab3dceb23cd6782b0fd4e95c2f', '2026-01-23 07:44:05', '2026-02-22 13:14:05', '2026-01-23 13:15:48', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(278, 1, '9a65ccfebb776bbacc234d692ad19b9c5bf46c62cd9699e95f15902c50c18fcc', '2026-01-23 07:45:48', '2026-02-22 13:15:48', '2026-01-23 13:37:22', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(279, 1, 'cdce22f27140cdea483e5a81b85b005f905b42aaff90a1017ef3fd0ed5d366ce', '2026-01-23 08:07:22', '2026-02-22 13:37:22', '2026-01-23 14:56:54', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(280, 1, '20bc9f6aac5c69252a3be1b33ef968aaa0d4467ec82c401eda63ee249a719d7d', '2026-01-23 09:26:54', '2026-02-22 14:56:54', '2026-01-23 14:58:10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(281, 1, '3de027ff5e709b79d74d8998224a60e5c8d902781a03d50b16d362d401774203', '2026-01-23 09:28:10', '2026-02-22 14:58:10', '2026-01-23 15:04:01', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(282, 1, '8422ffdea88fa9c5027de20135337980031e5182d9e47ca5429532a320287db9', '2026-01-23 09:34:02', '2026-02-22 15:04:01', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(283, 1, '61cf0397848c75a47664e5f1c43562613bc95b499659e104fb832d9cd28f599d', '2026-01-23 10:32:00', '2026-02-22 16:02:00', '2026-01-23 16:24:34', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(284, 1, '91189ea040980776d50a6a817c33cf51990b48fa11275558de0ea54cb2df4d90', '2026-01-23 10:54:35', '2026-02-22 16:24:35', '2026-01-26 12:42:19', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(285, 1, 'd560bca2a31b340a484722b5368bb5cd288339ddee0a11085598ffbec7e2722b', '2026-01-26 07:12:19', '2026-02-25 12:42:19', '2026-01-26 12:42:20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(286, 1, '34046477628ae0ae65d45a1e3a519e274f06a45720c8b7ae3a37a79a974a6fe1', '2026-01-26 07:12:20', '2026-02-25 12:42:20', '2026-01-26 12:53:26', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(287, 1, '7ac18068ef526d13087c6ed5c74d6926a75c57f93f08cab1f3ea509bec484961', '2026-01-26 07:23:26', '2026-02-25 12:53:26', '2026-01-26 12:55:25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(288, 1, '824972de3976919fd277598001e5e57ba07540f6e2f1407d62ba3be99361211d', '2026-01-26 07:25:25', '2026-02-25 12:55:25', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(289, 1, '4ab05f38549214aa58771fa2f69381a94153bc99603c3cb29f29eb80ffd73193', '2026-01-26 08:08:18', '2026-02-25 13:38:18', '2026-01-26 13:55:24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(290, 1, 'b84b00a167bcadd5df25ed18c94ec32be28a8c806071d71810497730a1ad0b45', '2026-01-26 08:25:24', '2026-02-25 13:55:24', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(291, 1, '5dcbcab29b9adc7e6fe1eef43444088923b6de2fa6e067c143f3c28fc8c7f153', '2026-01-26 08:54:55', '2026-02-25 14:24:55', '2026-01-26 14:40:09', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(292, 1, '5f587f77d3312d8645ec79d9f0288622e6d45ec421d05c74d624d7e9ce6d4144', '2026-01-26 09:10:09', '2026-02-25 14:40:09', '2026-01-26 14:42:34', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(293, 1, 'cac235f8813ef8d395305d048fae7ca2c8d3efcfc6003a7ec33380f964dcdbe1', '2026-01-26 09:12:34', '2026-02-25 14:42:34', '2026-01-26 14:47:33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(294, 1, 'a660de75f037545637bef7345bec59a2e183b280c9202ffbf8df9a97100255ed', '2026-01-26 09:17:33', '2026-02-25 14:47:33', '2026-01-26 14:59:14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(295, 1, 'd0735a6d7ea289ee81c4ce9f5f582849f38a7268b17d4ccc9dc4cdc6dcb29852', '2026-01-26 09:29:14', '2026-02-25 14:59:14', '2026-01-26 15:44:49', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(296, 1, 'ff0bb663b73dd0b8fcfc7b229594f0806121a916737b7d48c85100edc5c67bc0', '2026-01-26 10:14:49', '2026-02-25 15:44:49', '2026-01-26 15:44:53', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(297, 1, '524e71fdd30ac119ee1461e8212f6eaf1700ffffd0f0eca56cf8d58776a3590a', '2026-01-26 10:14:53', '2026-02-25 15:44:53', '2026-01-26 15:44:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(298, 1, '781ddb46161a967bd6d71910f8dd59e8f4275bf47643f8e0f8b40cc6d83cbf14', '2026-01-26 10:14:56', '2026-02-25 15:44:56', '2026-01-26 15:48:15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(299, 1, '9da9e3a0b9b97c4c4a3ef9524f4efdf326d3cf023972e0723c9b543e6be921ed', '2026-01-26 10:18:15', '2026-02-25 15:48:15', '2026-01-26 15:57:17', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(300, 1, '8dc9fe26354db3e494b6a78c4776881f49c4a5efbe4a63ab632edbee8254e591', '2026-01-26 10:27:17', '2026-02-25 15:57:17', '2026-01-26 16:12:24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(301, 1, 'e2a4f2feefee86d554e5e8e1ca2c913a1375c6a7fac30207719715410ce7d0b8', '2026-01-26 10:42:24', '2026-02-25 16:12:24', '2026-01-26 16:20:47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(302, 1, 'bdd844ae833bd94a2daa6a42a41f016cf7939804a96d02107b1007d2ee029cc0', '2026-01-26 10:50:47', '2026-02-25 16:20:47', '2026-01-26 16:21:55', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(303, 1, 'bb609f7e6a2f51868f83f334f83ba877f761e198e20072f57188e29e1a385fbe', '2026-01-26 10:51:55', '2026-02-25 16:21:55', '2026-01-26 16:31:02', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(304, 1, '77c1f9492a8b61164ca7ad2a50e194a55ce05fadc1ddcfe212c36340311752f3', '2026-01-26 11:01:02', '2026-02-25 16:31:02', '2026-01-26 16:31:04', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(305, 1, '8860e910fa9ab2acdc6499747f8a09fefcab3ef26259d4bb8b6f6f3d431ac88a', '2026-01-26 11:01:04', '2026-02-25 16:31:04', '2026-01-26 16:31:11', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(306, 1, 'f2b1ff6a0b51a8652f55bf4440d9b96fc3df2f6b9d462f59f747acb59ea311a0', '2026-01-26 11:01:11', '2026-02-25 16:31:11', '2026-01-26 16:35:01', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(307, 1, '93851ad5d36edb5a3b3feb544a60ae528b13af822f0970330b65a70cd8972a91', '2026-01-26 11:05:01', '2026-02-25 16:35:01', '2026-01-26 16:35:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(308, 1, '9ddae574783eddba7117db09dae7369287c74b083346fa9640a790287ddb75a2', '2026-01-26 11:05:12', '2026-02-25 16:35:12', '2026-01-26 16:35:24', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(309, 1, '6a8541117e59ad07b0d3ade2bb2e80ef5257cc354164e8f683ee46ba190b635b', '2026-01-26 11:05:24', '2026-02-25 16:35:24', '2026-01-26 16:35:41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(310, 1, '338f66a606bcbc17c4cc8d2385a604edd1c67a1d4d85c9849cc25117262a9835', '2026-01-26 11:05:41', '2026-02-25 16:35:41', '2026-01-26 16:43:07', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(311, 1, '962a12c9c8c38207138eb4a40d371a8f985cace1c6092631801b202c6ab418e5', '2026-01-26 11:13:07', '2026-02-25 16:43:07', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(312, 1, '9057d160679fed31ea9ec501bab38de4e9fb2217d7932c242cd98c7b22632500', '2026-01-26 11:19:43', '2026-02-25 16:49:43', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1'),
(313, 1, 'fd8e586a1ac7374d1e43e1a925318090a73851f7fca6852d2211abbbb9151604', '2026-01-26 11:30:36', '2026-02-25 17:00:36', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '::1');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role` tinyint(3) UNSIGNED NOT NULL COMMENT '1=super_admin, 2=admin, 3=customer',
  `name` varchar(120) NOT NULL,
  `phone_no` varchar(20) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `loyalty_number` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role`, `name`, `phone_no`, `telephone`, `email`, `loyalty_number`, `address`, `password_hash`, `is_active`, `created_by`, `created_at`, `updated_at`, `updated_by`) VALUES
(1, 2, 'Admin Two', '0772222222', NULL, NULL, NULL, NULL, '$2a$12$UrrmxU8uwn2nNDUPgfmjDOLfYRHONPt86MzSzqw3pICNNyR9Aa0Bq', 1, 1, '2026-01-19 05:18:08', '2026-01-21 05:03:25', NULL),
(2, 4, 'new Customer', '0779999999', NULL, 'john@email.com', 'LOY123', 'Colombo 05', NULL, 1, 2, '2026-01-19 05:18:40', '2026-01-22 10:57:35', 1),
(6, 4, 'John Customer', '0779999990', '0112345678', 'jon@example.com', 'LOY1234', 'Colombo', NULL, 1, 1, '2026-01-19 06:19:12', '2026-01-21 05:35:02', NULL),
(8, 3, 'shandeep1', '0757082654', NULL, NULL, NULL, NULL, '$2b$10$OdJQmhJwTk2V1u2CgXL3UepDggkum7tG4Pj8lcjpXgNpOf/U5/pum', 1, 1, '2026-01-21 05:02:12', '2026-01-26 09:09:51', NULL),
(10, 4, 'shandeep', '0757082659', NULL, NULL, NULL, NULL, '$2b$10$Y2IRH8NJzhtx3zhi9ze0zeyFugnOqXtMyEBycQR8End7suSYw4Om6', 1, 1, '2026-01-21 05:11:37', '2026-01-26 09:09:55', NULL),
(11, 4, 'test customer', '07712345678', '1234567895', 'mike@demo.com', '456123', '65/64-2/1', NULL, 1, 1, '2026-01-22 08:24:26', '2026-01-22 08:24:26', NULL),
(12, 4, 'jessie', '07712345670', NULL, 'sarah@demo.com', '4561235', 'sssssssss', NULL, 0, 1, '2026-01-22 09:54:59', '2026-01-22 10:05:05', 1),
(14, 4, 'ashen', '0711122240', NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-01-26 09:19:12', '2026-01-26 09:19:12', NULL),
(15, 2, 'Prasanthan', '0773966920', NULL, 'Prasanthan@demo.com', NULL, NULL, '$2b$10$RfItevaSBL3ZBWOTidABSeEjl9w1gv5Il.KCfxU/P94b.AWcIrkna', 1, 1, '2026-01-26 11:20:24', '2026-01-26 11:20:24', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_date` (`booking_date`),
  ADD KEY `idx_booking_customer` (`customer_id`),
  ADD KEY `idx_booking_status` (`status`);

--
-- Indexes for table `booking_staff`
--
ALTER TABLE `booking_staff`
  ADD PRIMARY KEY (`booking_id`,`staff_id`),
  ADD KEY `idx_bs_staff` (`staff_id`),
  ADD KEY `idx_bs_assigned_by` (`assigned_by`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD KEY `idx_inv_booking` (`booking_id`),
  ADD KEY `idx_inv_issued_at` (`issued_at`),
  ADD KEY `idx_inv_created_by` (`created_by`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pay_booking` (`booking_id`),
  ADD KEY `idx_pay_paid_at` (`paid_at`),
  ADD KEY `idx_pay_active` (`is_active`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rt_user` (`user_id`),
  ADD KEY `idx_rt_hash` (`token_hash`),
  ADD KEY `idx_rt_expires` (`expires_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_no` (`phone_no`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `loyalty_number` (`loyalty_number`),
  ADD KEY `idx_users_phone` (`phone_no`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_created_by` (`created_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=314;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
