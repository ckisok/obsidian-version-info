const {Plugin, ItemView, apiVersion, FileSystemAdapter} = require("obsidian")
let {app, shell} = require("@electron/remote");
const path = require("path");

const VIEW_TYPE_VERSION_INFO = 'version-info-view';

class VersionInfoView extends ItemView {
    constructor(leaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_VERSION_INFO;
    }

    getDisplayText() {
        return '版本信息';
    }

    getIcon() {
        return 'git-compare'
    }

    addRow(tbody, name, value) {
        const row = tbody.createEl('tr');
        row.createEl('td', {text: name});
        row.createEl('td', {text: value});
    }

    addRowAction(tbody, name, path) {
        const row = tbody.createEl('tr');
        row.createEl('td', {text: name});
        const td = row.createEl('td');
        td.createEl('button', {
            text: '打开',
            onclick: () => {
                shell.showItemInFolder(path)
            }
        });
    }

    async onOpen() {
        const {contentEl} = this
        contentEl.empty()

        contentEl.createEl('h3', {text: '版本'});
        {
            // Create the table element
            const table = contentEl.createEl('table');

            // Create table header
            const thead = table.createEl('thead');
            const headerRow = thead.createEl('tr');
            headerRow.createEl('th', {text: '项目'});
            headerRow.createEl('th', {text: '值'});

            // Create table body
            const tbody = table.createEl('tbody');

            // Add some info rows
            this.addRow(tbody, 'installer', app.getVersion())
            this.addRow(tbody, 'version', apiVersion)
            this.addRow(tbody, 'chrome', process.versions.chrome)
            this.addRow(tbody, 'electron', process.versions.electron)
            this.addRow(tbody, 'node', process.versions.node)
            this.addRow(tbody, 'platform', process.platform)
            this.addRow(tbody, 'arch', process.arch)
        }

        contentEl.createEl('h3', {text: '目录'});
        {
            // Create the table element
            const table = contentEl.createEl('table');

            // Create table header
            const thead = table.createEl('thead');
            const headerRow = thead.createEl('tr');
            headerRow.createEl('th', {text: '项目'});
            headerRow.createEl('th', {text: '值'});

            // Create table body
            const tbody = table.createEl('tbody');
            const adapter = this.app.vault.adapter
            if (adapter instanceof FileSystemAdapter) {
                const configDir = adapter.getFullPath(this.app.vault.configDir)
                const pluginsDir = path.join(configDir, 'plugins')
                const themesDir = path.join(configDir, 'themes')
                const snippetsDir = path.join(configDir, 'snippets')
                this.addRowAction(tbody, '插件目录', pluginsDir)
                this.addRowAction(tbody, '主题目录', themesDir)
                this.addRowAction(tbody, '代码片段目录', snippetsDir)
                this.addRowAction(tbody, '仓库根目录', path.dirname(configDir))
                this.addRowAction(tbody, '软件数据目录', app.getPath('userData'))
            }
        }
    }

    async onClose() {
    }

    onload() {
    }

    onunload() {
    }
}

class VersionInfoPlugin extends Plugin {
    async onload() {
        this.registerView(VIEW_TYPE_VERSION_INFO, (leaf) => new VersionInfoView(leaf));

        this.addRibbonIcon('git-compare', '查看版本', () => {
            this.activateView()
        });
    }

    onunload() {
    }

    // 激活视图
    async activateView() {
        const {workspace} = this.app;

        let leaf;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_VERSION_INFO).filter(leaf => leaf.view instanceof VersionInfoView)

        if (leaves.length > 0) {
            // A leaf with our view already exists, use that
            leaf = leaves[0];
        } else {
            // Our view could not be found in the workspace, create a new leaf in the right sidebar for it
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({type: VIEW_TYPE_VERSION_INFO, active: true});
        }

        // "Reveal" the leaf in case it is in a collapsed sidebar
        await workspace.revealLeaf(leaf);
    }
}

module.exports = VersionInfoPlugin
