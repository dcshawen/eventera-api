IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Category] (
    [CategoryId] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Category] PRIMARY KEY ([CategoryId])
);
GO

CREATE TABLE [AstronomicalEvent] (
    [AstronomicalEventId] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [Location] nvarchar(max) NOT NULL,
    [StartDateTime] datetime2 NOT NULL,
    [CreatedDateTime] datetime2 NOT NULL,
    [CategoryId] int NOT NULL,
    CONSTRAINT [PK_AstronomicalEvent] PRIMARY KEY ([AstronomicalEventId]),
    CONSTRAINT [FK_AstronomicalEvent_Category_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Category] ([CategoryId]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AstronomicalEvent_CategoryId] ON [AstronomicalEvent] ([CategoryId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250926115305_initialMigration', N'8.0.14');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [AstronomicalEvent] ADD [imageUrl] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251003223319_AddsImageFieldToAstroEvent', N'8.0.14');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[AstronomicalEvent].[imageUrl]', N'ImageUrl', N'COLUMN';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251003223458_AddsImageFieldToAstroEvent2', N'8.0.14');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251010224654_AddsImage', N'8.0.14');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [AstronomicalEvent] ADD [Filename] nvarchar(max) NOT NULL DEFAULT N'';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251010225424_AddsFilename', N'8.0.14');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AstronomicalEvent]') AND [c].[name] = N'ImageUrl');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [AstronomicalEvent] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [AstronomicalEvent] DROP COLUMN [ImageUrl];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251010232958_RemoveImageURLField', N'8.0.14');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Ticket] (
    [TicketId] int NOT NULL IDENTITY,
    [PurchaserName] nvarchar(max) NOT NULL,
    [PurchaseDateTime] datetime2 NOT NULL,
    [AstronomicalEventId] int NOT NULL,
    CONSTRAINT [PK_Ticket] PRIMARY KEY ([TicketId]),
    CONSTRAINT [FK_Ticket_AstronomicalEvent_AstronomicalEventId] FOREIGN KEY ([AstronomicalEventId]) REFERENCES [AstronomicalEvent] ([AstronomicalEventId]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Ticket_AstronomicalEventId] ON [Ticket] ([AstronomicalEventId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251117002513_AddsTickets', N'8.0.14');
GO

COMMIT;
GO

