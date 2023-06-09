from django.conf import settings
import json, os

def navigation_link_list(accessType):
    linkList = []

    # Carregar lista de links do JSON
    jsonLinkList = json.loads(open(os.path.join(settings.BASE_DIR, 'apps/area_barbeiro/accessList.json'), encoding='utf-8').read())
    print(jsonLinkList)

    # Mostrar apenas os links se o usuario ter acesso a eles
    for access in jsonLinkList:
        if any(jobTitle in access['acessaSeFor'] for jobTitle in accessType):
            newLinkItem = {'nome': access['nome'], 'link': access['link'], 'icone': access['icone']}
            linkList.append(newLinkItem)

    return linkList

