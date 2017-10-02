import sys
import string
import re

def create_json():
	inputfile = open("text_schedule.txt", "r")
	schedule = open("schedule.json", "w")
	tojson = "["
	count = 0
	for line in inputfile:
		pieces = re.split(r'\t+', line)
		tojson = tojson + "{\"day\": " + "\"" + pieces[0] + "\",\n"
		tojson = tojson + "\"date\": " + "\"" + pieces[1] + "\",\n"
		tojson = tojson + "\"time\": " + "\"" + pieces[2] + "\",\n"
		tojson = tojson + "\"opponent\": " + "\"" + pieces[3][:-1] + "\"},\n"
	tojson = tojson[:-1]
	tojson = tojson + "]"
	schedule.write(tojson)

create_json()