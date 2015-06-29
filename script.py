import requests
from lxml import html
import string

BASE_URL = "http://penguins.nhl.com/club/schedule.htm?"

def create_json():
	schedule = open("schedule.json", "w")
	tojson = "{\"games\": ["
	page = requests.get(BASE_URL)
	tree = html.fromstring(page.text)
	scheduletable = tree.xpath('//td[@class="left"]/text()')
	count = 0
	for tableitem in scheduletable:
		tableitem = tableitem.replace("\t", "")
		tableitem = tableitem.replace("\n", "")
		tableitem = tableitem.replace("-", "")
		if len(tableitem) > 2:
			if count == 0:
				tojson = tojson + "{\"date\": "
			elif count == 1:
				tojson = tojson + "\"visitor\": "
			elif count == 2:
				tojson = tojson + "\"home\": "
			elif count == 3:
				tojson = tojson + "\"time\": "
			elif count == 4:
				tojson = tojson + "\"channel\": "
			count = (count + 1) % 5
			if count == 0:
				tojson = tojson + "\"" + tableitem + "\"\n"
				tojson = tojson + "},"
			else:
				tojson = tojson + "\"" + tableitem + "\",\n"
	tojson = tojson[:-1]
	tojson = tojson + "]}"
	schedule.write(tojson)

create_json()