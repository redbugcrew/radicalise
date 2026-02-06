-- Add migration script here

-- Assembly 1 No Records
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(1, 1, 1, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(2, 2, 1, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(3, 3, 1, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(4, 4, 1, 'Going', NULL);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(5, 5, 1, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(6, 6, 1, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(7, 7, 1, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(8, 8, 1, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(9, 14, 1, Null, Null);


-- Assembly 2 No Records

INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(10, 1, 2, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(11, 2, 2, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(12, 3, 2, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(13, 4, 2, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES (14, 5, 2, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES (15, 6, 2, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES (16, 7, 2, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES (17, 8, 2, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES (18, 14, 2, Null, Null);

-- Assembly 3

INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(19, 1, 3, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(20, 2, 3, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(21, 3, 3, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(22, 4, 3, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(23, 5, 3, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(24, 6, 3, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(25, 7, 3, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(26, 8, 3, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(27, 13, 3, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(28, 14, 3, 'Going', TRUE);

-- Assembly 4 - No records

INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(29, 1, 4, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(30, 2, 4, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(31, 3, 4, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(32, 4, 4, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(33, 5, 4, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(34, 6, 4, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(35, 7, 4, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(36, 8, 4, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(37, 13, 4, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(38, 14, 4, Null, Null);

-- Assembly 5 
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(39, 1, 5, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(40, 2, 5, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(41, 3, 5, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(42, 4, 5, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(43, 5, 5, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(44, 7, 5, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(45, 8, 5, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(46, 9, 5, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(47, 13, 5, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(48, 14, 5, 'Going', TRUE);

-- Assembly 6

INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(49, 1, 6, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(50, 2, 6, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(51, 3, 6, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(52, 4, 6, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(53, 5, 6, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(54, 7, 6, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(55, 8, 6, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(56, 9, 6, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(57, 13, 6, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(58, 14, 6, 'NotGoing', FALSE);

-- Assembly 7 
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(59, 1, 7, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(60, 2, 7, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(61, 3, 7, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(62, 4, 7, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(63, 5, 7, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(64, 7, 7, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(65, 8, 7, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(66, 9, 7, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(67, 10, 7, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(68, 13, 7, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(69, 14, 7, 'NotGoing', FALSE);

-- Assembly 8
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(70, 1, 8, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(71, 2, 8, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(72, 3, 8, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(73, 4, 8, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(74, 5, 8, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(75, 7, 8, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(76, 8, 8, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(77, 9, 8, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(78, 10, 8, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(79, 11, 8, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(80, 13, 8, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(81, 14, 8, 'Going', TRUE);

-- Assembly 9

INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(82, 1, 9, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(83, 2, 9, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(84, 3, 9, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(85, 4, 9, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(86, 5, 9, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(87, 7, 9, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(88, 8, 9, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(89, 9, 9, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(90, 10, 9, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(91, 11, 9, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(92, 12, 9, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(93, 13, 9, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(94, 14, 9, 'NotGoing', FALSE);

-- Assembly 10 

INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(95, 1, 10, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(96, 2, 10, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(97, 3, 10, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(98, 4, 10, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(99, 5, 10, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(100, 7, 10, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(101, 8, 10, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(102, 9, 10, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(103, 10, 10, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(104, 11, 10, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(105, 12, 10, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(106, 13, 10, Null, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(107, 14, 10, Null, Null);

-- Assembly 11
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(108, 1, 11, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(109, 2, 11, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(110, 3, 11, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(111, 4, 11, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(112, 5, 11, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(113, 7, 11, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(114, 8, 11, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(115, 9, 11, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(116, 10, 11, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(117, 11, 11, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(118, 12, 11, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(119, 13, 11, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(120, 14, 11, NULL, Null);

-- Assembly 13
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(121, 1, 13, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(122, 2, 13, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(123, 3, 13, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(124, 4, 13, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(125, 5, 13, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(126, 7, 13, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(127, 8, 13, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(128, 9, 13, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(129, 10, 13, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(130, 12, 13, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(131, 13, 13, NULL, Null);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(132, 14, 13, NULL, Null);

-- Assembly 14
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(133, 1, 14, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(134, 2, 14, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(135, 3, 14, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(136, 4, 14, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(137, 5, 14, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(138, 7, 14, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(139, 8, 14, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(140, 9, 14, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(141, 12, 14, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(142, 13, 14, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(143, 14, 14, 'Uncertain', FALSE);

-- Assembly 15
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(144, 1, 15, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(145, 2, 15, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(146, 3, 15, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(147, 4, 15, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(148, 5, 15, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(149, 7, 15, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(150, 8, 15, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(151, 9, 15, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(152, 12, 15, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(153, 13, 15, 'NotGoing', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(154, 14, 15, 'Uncertain', FALSE);

-- Assembly 16
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(155, 1, 16, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(156, 2, 16, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(157, 3, 16, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(158, 4, 16, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(159, 5, 16, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(160, 7, 16, 'Uncertain', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(161, 8, 16, 'NotGoing', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(162, 9, 16, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(163, 12, 16, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(164, 13, 16, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(165, 14, 16, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(166, 15, 16, 'Uncertain', FALSE);

-- Retreat 1
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(167, 1, 17, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(168, 2, 17, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(169, 3, 17, 'NotGoing',TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(170, 4, 17, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(171, 5, 17, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(172, 7, 17, 'NotGoing', FALSE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(173, 8, 17, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(174, 9, 17, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(175, 12, 17, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(176, 13, 17, 'Going', TRUE);
INSERT INTO calendar_event_attendances (id, person_id, calendar_event_id, intention, actual) VALUES(177, 14, 17, 'NotGoing', TRUE);