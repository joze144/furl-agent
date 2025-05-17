APP := furl-agent
TAG := latest
DOCKER_REGISTRY ?= jozhe15

all: build push

build:
	docker build --platform linux/amd64 -t $(DOCKER_REGISTRY)/$(APP):latest .

push:
	docker push $(DOCKER_REGISTRY)/$(APP):latest