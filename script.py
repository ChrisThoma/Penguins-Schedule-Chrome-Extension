import requests
from lxml import html
import string

BASE_URL = "http://penguins.nhl.com/club/schedule.htm?season=20142015&gameType=4"

def other_method():
	schedule = open("schedule.json", "w")
	tojson = "{\"games\": ["
	page = requests.get(BASE_URL)
	tree = html.fromstring(page.text)
	stuff = tree.xpath('//td[@class="left"]/text()')
	gameinfo = []
	count = 0
	totalCount = 0
	for thing in stuff:
		thing = thing.replace("\t", "")
		thing = thing.replace("\n", "")
		thing = thing.replace("-", "")
		if len(thing) > 2:
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
				tojson = tojson + "\"" + thing + "\"\n"
				tojson = tojson + "},"
			else:
				tojson = tojson + "\"" + thing + "\",\n"
	tojson = tojson[:-1]
	tojson = tojson + "]}"
	schedule.write(tojson)

other_method()