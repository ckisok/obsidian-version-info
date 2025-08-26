const {Plugin, ItemView, apiVersion} = require("obsidian")
let { app } = require("@electron/remote");

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
        row.createEl('td', { text: name });
        row.createEl('td', { text: value });
    }

    async onOpen() {
        const {contentEl} = this
        contentEl.empty()

        contentEl.createEl('h3', { text: '版本信息' });

        // Create the table element
        const table = contentEl.createEl('table');

        // Create table header
        const thead = table.createEl('thead');
        const headerRow = thead.createEl('tr');
        headerRow.createEl('th', { text: '属性' });
        headerRow.createEl('th', { text: '值' });

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

    async activateView() {
        const { workspace } = this.app;

        let leaf = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_VERSION_INFO).filter(leaf => leaf.view instanceof VersionInfoView)

        if (leaves.length > 0) {
            // A leaf with our view already exists, use that
            leaf = leaves[0];
        } else {
            // Our view could not be found in the workspace, create a new leaf in the right sidebar for it
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE_VERSION_INFO, active: true });
        }

        // "Reveal" the leaf in case it is in a collapsed sidebar
        await workspace.revealLeaf(leaf);
    }
}

module.exports = VersionInfoPlugin
