CREATE DATABASE `adminlte`
/*!40100 DEFAULT CHARACTER SET utf8 */
/*!80016 DEFAULT ENCRYPTION='N' */;

CREATE TABLE `user_useraccess` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `useraccessid` int(11) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8;

CREATE TABLE `useraccess` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `URL` varchar(255) NOT NULL,
  `type` varchar(5) NOT NULL,
  `icon` varchar(45) DEFAULT NULL,
  `sortorder` int(11) DEFAULT NULL,
  `deactivated` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `Name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8;

CREATE TABLE `userdata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `userdatatypeid` int(11) NOT NULL,
  `value` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

CREATE TABLE `userdatatypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `desc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='	';

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(45) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `salt` varchar(45) DEFAULT NULL,
  `firstName` varchar(45) DEFAULT NULL,
  `lastName` varchar(45) DEFAULT NULL,
  `email` varchar(145) DEFAULT NULL,
  `deactivated` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `username_UNIQUE` (`userName`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8;

insert into
    users (userName, password, firstName, lastName, email)
values
    (
        'Admin',
        '$2a$10$Jjl.5jAwZevvMkKdCqOY2ufGydMuVsC3daBT5TJm9RlvGPxPhjo2S', # Password is adminLTE
        'AdminLTE',
        'Admin',
        'adminlte@express.io'
    );

insert into
    useraccess (name, description, URL, type, icon, sortorder)
values
    ('HomePage', 'Home', '/', 'ALL', 'fa-home', 1);

insert into
    useraccess (name, description, URL, type, icon, sortorder)
values
    ('UserEdit', 'Admin Users', '/userAdmin/', 'ALL', 'fa-user-circle', 2);

insert into
    useraccess (name, description, URL, type, icon, sortorder)
values
    ('UserAccess', 'Access Levels', '/userAccess/', 'ALL', 'fa-unlock-alt', 3);
    
insert into
    user_useraccess (userid, useraccessid)
select
    u.id userid,
    ua.id useraccessid
from
    useraccess ua,
    users u;