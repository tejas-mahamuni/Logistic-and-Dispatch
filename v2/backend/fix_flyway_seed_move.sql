-- Run this once after moving V2 seed to db/seed/
-- It removes the old V2 Flyway history entry so the app can restart cleanly.
-- Execute from MySQL Workbench or: mysql -u root -p logistic_dispatch < fix_flyway_seed_move.sql

DELETE FROM flyway_schema_history WHERE version = '2';
