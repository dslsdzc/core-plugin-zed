use zed_extension_api as zed;

struct CoreExtension;

impl zed::Extension for CoreExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _config: &zed::LanguageServerConfig,
        worktree: &zed::Worktree,
    ) -> zed::Result<zed::Command> {
        let server_path = worktree.which("core-lsp")
            .ok_or_else(|| "core-lsp not found in PATH.\nInstall core-lsp or ensure it's on your PATH.".to_string())?;

        Ok(zed::Command {
            command: server_path,
            args: vec![],
            env: Default::default(),
        })
    }
}

zed::register_extension!(CoreExtension);
