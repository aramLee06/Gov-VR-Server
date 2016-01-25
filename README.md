<<<<<<< HEAD


# GP-Server



## Usage

서버 시작하는 방법

1. 아마존 혹은 알리윤서버에 SSH를 사용하여 터미널로 연결

2. `>_ su gameparty` 로 gameparty계정으로 변경

3. cd ~/gameparty_server  게임 서버 경로로 이동

4. Shell Script를 이용하여 서버 실행 가능

	./start.sh {{COMMAND}} {{TYPE}}
	
### COMMAND

* start - 시작
* list - 실행중인 서버 리스트
* stop - 종료
* restart - 재시작

### TYPE

* all
* rest
* game

## File Structure

[Follow this link](doc/file_structure.md)