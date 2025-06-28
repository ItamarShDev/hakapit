self.addEventListener("push", (event) => {
    if (event.data) {
        try {
            const parsedData = event.data.json();
            const options = {
                body: parsedData.body,
                icon: parsedData.icon || "/icon.png",
                badge: "/liverpool-logo.webp",
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: "2",
                    url: data.url || "https://hakapit.online",
                },
            };
            event.waitUntil(self.registration.showNotification(data.title, options));
        } catch (e) {
            const parsedData = event.data.text();
            const options = {
                body: parsedData,
                icon: "/icon.png",
                badge: "/liverpool-logo.webp",
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: "2",
                    url: "https://hakapit.online",
                },
            };
            event.waitUntil(self.registration.showNotification("New Podcast Episode!", options));
        }
    }
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "https://hakapit.online";
    event.waitUntil(clients.openWindow(url));
});

async function fetchLatestEpisode() {
    try {
        const response = await fetch('/api/load');
        if (response.status === 200) {
            const data = await response.json();
            if (data && Object.keys(data).length > 0) {
                // Compose notification content
                const title = "New Podcast Episode!";
                const body = Object.entries(data)
                    .map(([podcast, episode]) => `${podcast}: ${episode?.title || 'New episode'}`)
                    .join('\n');
                self.registration.showNotification(title, {
                    body,
                    icon: "/icon.png",
                    badge: "/liverpool-logo.webp",
                    data: {
                        url: Object.values(data)[0]?.link || "https://hakapit.online",
                        dateOfArrival: Date.now(),
                        primaryKey: "auto-periodic-notification"
                    }
                });
            }
        }
    } catch (e) {
        // Optionally handle errors
    }
}

async function fetchTransfers() {
    try {
        const response = await fetch('/api/transfers');
        if (response.status === 200) {
            const data = await response.json();
            if (data && Object.keys(data).length > 0) {
                // Compose notification content
                const title = "רכש חדש!";
                const body = Object.entries(data)
                    .map(([name, transfer]) => `${name}: ${transfer?.type || 'לא ידוע'}`)
                    .join('\n');
                self.registration.showNotification(title, {
                    body,
                    icon: "/icon.png",
                    badge: "/liverpool-logo.webp",
                    data: {
                        url: Object.values(data)[0]?.link || "https://hakapit.online",
                        dateOfArrival: Date.now(),
                        primaryKey: "auto-periodic-notification"
                    }
                });
            }
        }
    } catch (e) {
        // Optionally handle errors
    }
}

self.addEventListener("periodicsync", (event) => {
    if (event.tag === "fetch-latest-episode") {
        event.waitUntil(fetchLatestEpisode());
    }
    if (event.tag === "new-transfers") {
        event.waitUntil(fetchTransfers());
    }
});