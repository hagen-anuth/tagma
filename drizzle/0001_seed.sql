INSERT INTO "preferences" ("id", "currency", "locale") VALUES (1, 'EUR', 'de-DE');
--> statement-breakpoint
INSERT INTO "categories" ("name", "kind", "sort_order") VALUES
	('salary', 'income', 10),
	('other income', 'income', 90),
	('rent', 'expense', 10),
	('utilities', 'expense', 20),
	('insurance', 'expense', 30),
	('groceries', 'expense', 40),
	('transport', 'expense', 50),
	('subscriptions', 'expense', 60),
	('dining out', 'expense', 70),
	('health', 'expense', 80),
	('leisure', 'expense', 90),
	('other', 'expense', 100);
