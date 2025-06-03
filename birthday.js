import { config } from "./config.js";

const birthdays = [
    { name: "Mamka", date: "1970-03-18", type: 1 },
    { name: "Mamka", date: "1970-06-24", type: 2 },
    { name: "Táta", date: "1968-09-24", type: 1 },
    { name: "Táta", date: "1968-12-30", type: 2 },
    { name: "Héďa", date: "2005-08-18", type: 1 },
    { name: "Héďa", date: "2005-10-15", type: 2 },
    { name: "babička Jiřinka", date: "1950-09-01", type: 1 },
    { name: "babička Jiřinka", date: "1950-07-15", type: 2 },
    { name: "děda Jára", date: "1947-05-24", type: 1 },
    { name: "děda Jára", date: "1947-04-27", type: 2 },
    { name: "Ila", date: "2003-11-07", type: 1 },
    { name: "Ila", date: "2003-04-20", type: 2 },
    { name: "Jirka", date: "1999-02-01", type: 1 }, // TODO den
    { name: "Jirka", date: "1999-04-24", type: 2 },
    // TODO babička Eva
    // TODO děda Pepa
    { name: "Mezinárodní den žen", date: "0000-03-08", type: 3 },
    { name: "Valentýn", date: "0000-02-14", type: 3 },
    { name: "Den matek", date: "0000-03-08", type: 4 },
    { name: "Den otců", date: "0000-06-15", type: 4 }
];

const sendBirthdayreminders = async (client) => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const todayBirthdays = birthdays.filter(x => {
        const [_, month, day] = x.date.split("-").map(Number);
        if (x.type == 4) {
            const dayDiff = todayDay - day;
            return month == todayMonth && dayDiff >= 0 && dayDiff < 7 && today.getDay() == 3;
        }
        return month == todayMonth && day == todayDay;
    });

    if (todayBirthdays.length > 0) {
        try {
            const user = await client.users.fetch(config.myUserId);
            if (user) {
                const message = todayBirthdays.map(x => {
                    switch (x.type) {
                        case 1: {
                            const age = todayYear - Number(x.date.split("-")[0]);
                            return `Dnes slaví ${x.name} ${age}. narozeniny!`;
                        }
                        case 2: {
                            return `Dnes slaví ${x.name} svátek!`;
                        }
                        case 3: case 4: {
                            return `Dnes je ${x.name}!`;
                        }
                    }
                }).join("\n");

                await user.send(message);
                console.log("Birthday reminder sent successfully");
            }
        } catch (err) {
            console.error("Failed to send birthday reminder:", err);
        }
    }
}

export {
    sendBirthdayreminders
}