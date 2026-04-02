def abadge(href: str, name: str) -> str:
    name = name.lower()

    if name == 'youtubeg':
        fullname = 'social/youtube-singular'
        name = 'youtube'
    elif name == 'kofig':
        fullname = 'donate/kofi-singular'
        name = 'kofi'
    elif name == 'boostyg':
        fullname = 'donate/generic-singular'
        name = 'boosty'
    elif name == 'x':
        fullname = 'social/twitter-singular'
        name = 'x (twitter)'
    elif name == 'website':
        fullname = 'documentation/website'
    else:
        fullname = 'available/' + name

    return f'<a href="{href}"><img src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3/assets/compact-minimal/{fullname}_vector.svg" alt="{name}" height="32" align="center"></a>'

import json

j = None
with open('src/data/site.json') as f:
    j = json.load(f)['members']

jdevs = j['developers']
jartists = j['artists']
jothers = j['others']

def badgify(socials: dict) -> list[str]:
    return list(map(lambda t: abadge(t[1], t[0]), socials.items()))

def attribute(entry) -> str:
    socials = {}
    if 'socials' in entry:
        socials |= entry['socials']

    if 'link' in entry:
        socials["website"] = entry["link"]

    badges = ' '.join(badgify(socials))
    result = f'- **{entry["name"]}** - {entry["role"]}'

    if badges:
        result += ': ' + badges

    return result

print('### Our Team\n')
print('\n'.join(map(attribute, jdevs + jartists)))

print('\n')

print('### Thank You\'s\n')
print('\n'.join(map(attribute, jothers)))
