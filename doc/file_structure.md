# File Structure

	+-- bin/
	|   +-- all
	|   +-- rest
	|   +-- game
	+-- config/
	|   +-- config.json
	|   +-- errorCode.json
	+-- log/
	+-- public
	|   +-- gp_images/
	+-- src/com/cspmedia
	|   +-- auth/
	|   |   +-- gameparty_auth.js
	|   +-- database/
	|   |   +-- query/
	|   |   +-- gameparty_mongo.js
	|   |   +-- gameparty_mysql.js
	|   |   +-- hiq_mysql.js
	|   |   +-- spacerunner_mysql.js
	|   +-- gameparty/
	|   |   +-- hiq/
	|   |   |   +-- hiq_error.js
	|   |   |   +-- host.js
	|   |   +-- spacerunner/
	|   |   |   +-- ImageUtil.js
	|   |   |   +-- spacerunner.js
	|   |   +-- gameparty_error.js
	|   |   +-- gameparty_game.js
	|   |   +-- gameparty_launcher.js
	|   |   +-- gameparty_user.js
	|   +-- log/
	|   |   +-- gameparty_logger.js
	|   +-- net/tcp/
	|   |   +-- gp_console_log.js
	|   |   +-- gp_integrated_roommanager.js
	|   |   +-- gp_tcpsoc_connector.js
	|   +-- util
	|   |   +-- gameparty_check_rest.js
	|   |   +-- gameparty_room_info.js
	+-- app_game.js
	+-- app_rest.js
	+-- package.json
	+-- start.sh


## ROOT/

### start.sh

서버 실행 Shell Script, [README.md](../README.md) 참조

### package.json

node npm 에서 생성하는 dependency 관리 파일

### app_game.js

Game Server 에 대한 내부 configure 및 Main 파일 (실행은 아님)

### app_rest.js

Rest Server 에 대한 내부 configure 및 Main 파일 (실행은 아님)

## bin/

실행 파일 폴더, `node bin/xxx` 로도 실행이 가능하나, 서비스로 실행할때는 반드시 `/start.sh`를 사용해야 함.

### all

Rest 및 Game 동시 실행

### rest

Rest Server 실행

### game

Game Server 실행

## config/

설정 파일 폴더

### config.json

서버 실행에 대한 각종 설정

* rest - Rest서버에 관한 설정 필드
* game - Game서버에 관한 설정 필드
* mysql - 연결할 MySql 서버 및 계정 정보
* mongodb - 연결할 MongoDB 서버 정보
* sql_path - 서버 내부에서 로드할 SQL 파일 위치
* use_global_sql - SQL 로드 여부

### errorCode.json

Rest 서버에서 사용되는 에러 코드 및 메시지의 정의

## log/

로그가 생성되는 폴더, yyyy-mm-dd-{{type}}.log 형식으로 생성됨

{{type}} 으로는

* debug
* error
* info

## public/

일반적으로 API Test Webpage의 리소스가 존재하나, gp-images는 예외적이다.

### gp-images

게임 및 사용자 등록에 사용된 사진이 존재함

## src/com/cspmedia

소스 폴더 파일. [Follow this link](src.md)