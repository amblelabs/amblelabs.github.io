class Member {
    constructor(name, bio, logoPath, website, github_name) {
        this.name = name;
        this.bio = bio;
        this.logoPath = logoPath;
        this.website = website;

        if (github_name != null)
            this.github = "https://github.com/" + github_name;
    }

    toElement() {
        // create "section-window" div
        let window = document.createElement("div");
        window.classList.add("section-window");
        window.id = this.id;

        if (this.logoPath != null) {
            let logo = document.createElement("img");

            logo.classList.add("project-logo");
            logo.src = this.logoPath;

            window.appendChild(logo);
        }

        if (this.name != null) {
            let header = document.createElement("h1");

            header.textContent = this.name;

            window.appendChild(header);
        }

        if (this.bio != null) {
            let description = document.createElement("h3");

            description.textContent = this.bio;

            window.appendChild(description);
        }

        if (this.website != null) {
            let websiteLink = document.createElement("a");
            websiteLink.href = this.website;

            let websiteImg = document.createElement("img");
            websiteImg.src = "https://img.shields.io/badge/goto_website-white" + "?style=flat-square&color=white"; 
            websiteImg.classList.add("link-img");
            websiteLink.appendChild(websiteImg);

            window.appendChild(websiteLink);
            window.appendChild(document.createElement("br"))
        }

        if (this.github != null) {
            let githubLink = document.createElement("a");
            githubLink.href = this.github;

            let githubImg = document.createElement("img");
            
            let ids = this.github.split("/")
            githubImg.src = "https://img.shields.io/github/stars/" + ids[3]  + "?logo=github&logoColor=black&style=flat-square&labelColor=white&color=white";
            
            githubImg.classList.add("link-img")
            githubLink.appendChild(githubImg);

            window.appendChild(githubLink);
            window.appendChild(document.createElement("br"))
        }

        return window;
    }
}

let members = new Array();
members.push(new Member("duzo", "hi", "https://duzo.is-a.dev/img/self.jpg", "https://duzo.is-a.dev/", "duzos"))
members.push(new Member("loqor", "LOQOR WRITE SOMETHING HERE PLEASE TODO", "https://loqor.dev/img/self.png", "https://loqor.dev/", "loqor"))
members.push(new Member("theo", "theo theo theo", "https://theo.is-a.dev/assets/portrait.png", "https://theo.is-a.dev/", "DrTheodor"))
members.push(new Member("maketendo", "i tried to put the perfectest face", "img/team/maketendo.png", "https://modrinth.com/user/Maketendo", "MaketendoDev"))

function updateMembersWindow() {
    let element = document.getElementById("members");
    element.replaceChildren();

    for (let i = 0; i < members.length; i++) {
        item = members[i];

        let created = item.toElement();
        element.appendChild(created);
    };
}

document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('load', () => {
        updateMembersWindow();
    });
});