if [[ -z "${CONFIG_JSON}" ]]; then
  echo "CONFIG_JSON environment variable not set. Not overriding config.json file."
else
  echo "CONFIG_JSON environment variable set. Overriding config.json file."
  echo ${CONFIG_JSON} > /usr/src/app/static/config.json
fi