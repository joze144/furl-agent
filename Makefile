APP := furl-agent
TAG := $(shell git rev-list --count HEAD)
DOCKER_REGISTRY ?= jozhe15

all: build push

build:
	docker build --platform linux/amd64 -t $(DOCKER_REGISTRY)/$(APP):$(TAG) .

push:
	docker push $(DOCKER_REGISTRY)/$(APP):$(TAG)
