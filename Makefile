up:
	docker-compose up --build
watch:
	npm run watch
emit:
	npm run emit
listen:
	npm run listen streamer:listen blog.streamer.event -- --group=local_d --consumer=2