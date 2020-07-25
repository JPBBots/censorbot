(function($) {
    // TODO: make the node ID configurable
    var treeNode = $('#jsdoc-toc-nav');

    // initialize the tree
    treeNode.tree({
        autoEscape: false,
        closedIcon: '&#x21e2;',
        data: [{"label":"<a href=\"global.html\">Globals</a>","id":"global","children":[]},{"label":"<a href=\"App.html\">App</a>","id":"App","children":[]},{"label":"<a href=\"BucketManager.html\">BucketManager</a>","id":"BucketManager","children":[]},{"label":"<a href=\"Cache.html\">Cache</a>","id":"Cache","children":[]},{"label":"<a href=\"CensorBot.html\">CensorBot</a>","id":"CensorBot","children":[]},{"label":"<a href=\"Client.html\">Client</a>","id":"Client","children":[]},{"label":"<a href=\"Cluster.html\">Cluster</a>","id":"Cluster","children":[]},{"label":"<a href=\"Command.html\">Command</a>","id":"Command","children":[]},{"label":"<a href=\"CommandHandler.html\">CommandHandler</a>","id":"CommandHandler","children":[]},{"label":"<a href=\"DBL.html\">DBL</a>","id":"DBL","children":[]},{"label":"<a href=\"Database.html\">Database</a>","id":"Database","children":[]},{"label":"<a href=\"DiscordWebsocket.html\">DiscordWebsocket</a>","id":"DiscordWebsocket","children":[]},{"label":"<a href=\"Embed.html\">Embed</a>","id":"Embed","children":[]},{"label":"<a href=\"EventHandler.html\">EventHandler</a>","id":"EventHandler","children":[]},{"label":"<a href=\"Filter.html\">Filter</a>","id":"Filter","children":[]},{"label":"<a href=\"Interface.html\">Interface</a>","id":"Interface","children":[]},{"label":"<a href=\"Internals.html\">Internals</a>","id":"Internals","children":[]},{"label":"<a href=\"JPBExp.html\">JPBExp</a>","id":"JPBExp","children":[]},{"label":"<a href=\"Logger.html\">Logger</a>","id":"Logger","children":[]},{"label":"<a href=\"Manager.html\">Manager</a>","id":"Manager","children":[]},{"label":"<a href=\"Master.html\">Master</a>","id":"Master","children":[]},{"label":"<a href=\"MasterAPI.html\">MasterAPI</a>","id":"MasterAPI","children":[]},{"label":"<a href=\"OAuth2.html\">OAuth2</a>","id":"OAuth2","children":[]},{"label":"<a href=\"PresenceManager.html\">PresenceManager</a>","id":"PresenceManager","children":[]},{"label":"<a href=\"Punishments.html\">Punishments</a>","id":"Punishments","children":[]},{"label":"<a href=\"Reloader.html\">Reloader</a>","id":"Reloader","children":[]},{"label":"<a href=\"Shard.html\">Shard</a>","id":"Shard","children":[]},{"label":"<a href=\"ShardManager.html\">ShardManager</a>","id":"ShardManager","children":[]},{"label":"<a href=\"TicketManager.html\">TicketManager</a>","id":"TicketManager","children":[]},{"label":"<a href=\"UpdatesManager.html\">UpdatesManager</a>","id":"UpdatesManager","children":[]},{"label":"<a href=\"Webhook.html\">Webhook</a>","id":"Webhook","children":[]},{"label":"<a href=\"WebhookManager.html\">WebhookManager</a>","id":"WebhookManager","children":[]},{"label":"<a href=\"Worker.html\">Worker</a>","id":"Worker","children":[]},{"label":"<a href=\"WorkerInternals.html\">WorkerInternals</a>","id":"WorkerInternals","children":[]}],
        openedIcon: ' &#x21e3;',
        saveState: false,
        useContextMenu: false
    });

    // add event handlers
    // TODO
})(jQuery);
