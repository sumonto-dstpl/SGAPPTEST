use tauri_plugin_sql::{Migration, MigrationKind};

pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_schema",
            sql: include_str!("../migrations/001_initial.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_remarks_paidrent_snapshot",
            sql: include_str!("../migrations/002_add_remarks_paidrent_snapshot.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add_payment_remark",
            sql: include_str!("../migrations/003_add_payment_remark.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_owner_column",
            sql: include_str!("../migrations/004_add_owner_column.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "garage_no_per_owner_unique",
            sql: include_str!("../migrations/005_garage_no_per_owner_unique.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:pgms.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
