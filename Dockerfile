# 1. 베이스 이미지 설정
FROM node:22

# 2. 작업 디렉토리 생성
WORKDIR /app

# 3. 패키지 복사 및 설치
COPY package*.json ./
RUN npm install

# 4. 앱 소스 복사
COPY . .

# 5. 포트 개방
EXPOSE 3000

# 6. 앱 실행
CMD ["npm", "start"]
