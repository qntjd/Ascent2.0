# ⚡ Ascent

> 팀 협업을 위한 올인원 프로젝트 관리 플랫폼

**Backend:** Spring Boot 4.0.2 · **Frontend:** React + TypeScript · **Deploy:** Railway (Backend) / Vercel (Frontend)

---

## 주요 기능

### 🔐 인증
- JWT 기반 인증 (Access Token 6시간 / Refresh Token 14일)
- 자동 토큰 갱신
- 닉네임 수정

### 📁 프로젝트 관리
- 프로젝트 생성 및 멤버 초대 (초대 코드 7일 유효, 재사용)
- 멤버 역할 관리 (OWNER / MEMBER)
- 멤버별 역할 설명(태그) 설정

### 💬 실시간 채팅
- WebSocket(STOMP) 기반 실시간 메시지
- 이미지/파일 첨부 (Cloudinary 업로드 후 채팅창 인라인 표시)

### 🗂️ 칸반 보드
- 드래그 앤 드롭 태스크 관리 (TODO / IN_PROGRESS / DONE)
- 우선순위(HIGH / MEDIUM / LOW), 담당자, 마감일 설정
- 일정과 연동

### 📅 일정
- 캘린더 뷰 + 리스트 뷰
- 담당자 지정, 완료 체크
- 칸반 카드 마감일과 연동

### 📝 회의록
- 회의 내용, 액션 아이템, 결정사항 기록
- 회의록 PDF 내보내기
- 칸반 카드에 액션 아이템 연동

### 📎 파일 관리
- Cloudinary 업로드 (이미지 / PDF / 일반 파일)
- 백엔드 프록시 다운로드 (CORS 없이 안전하게)

### 🕐 타임라인
- 일정 + 회의록을 시간순 피드로 한눈에
- 담당자 / 타입별 필터
- 오늘 항목 강조 표시

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Spring Boot 4.0.2, Spring Security, Spring Data JPA, WebSocket (STOMP) |
| Frontend | React 18, TypeScript, Vite |
| DB | PostgreSQL (Railway) |
| 파일 스토리지 | Cloudinary |
| 배포 | Railway (Backend), Vercel (Frontend) |
| 인증 | JWT (Access + Refresh Token) |

---

## 시작하기

### 환경 변수

**Backend (`application.yml` 또는 Railway 환경 변수)**

```
DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend (`.env`)**

```
VITE_API_URL=https://your-backend.railway.app/api
VITE_WS_URL=wss://your-backend.railway.app/ws
```

### 로컬 실행

```bash
# Backend
./gradlew bootRun

# Frontend
npm install
npm run dev
```

---

## 프로젝트 구조

```
ascent-core/
├── ascent-backend/          # Spring Boot
│   └── src/main/java/com/ascent/ascent_core/
│       ├── domain/
│       │   ├── user/        # 사용자 인증
│       │   ├── project/     # 프로젝트 / 멤버 / 초대 코드
│       │   ├── kanban/      # 칸반 보드
│       │   ├── schedule/    # 일정
│       │   ├── meeting/     # 회의록
│       │   └── file/        # 파일 업로드
│       ├── chat/            # WebSocket 채팅
│       └── global/          # JWT, 예외 처리, 공통 응답
│
└── ascent-frontend/         # React + TypeScript
    └── src/
        ├── api/             # Axios API 모듈
        ├── pages/           # 라우팅 페이지
        ├── components/
        │   └── dashboard/   # 대시보드 탭 컴포넌트
        └── types/           # 공통 타입 정의
```

---

## API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| GET | `/api/projects` | 프로젝트 목록 |
| POST | `/api/projects` | 프로젝트 생성 |
| POST | `/api/projects/{id}/invite-code` | 초대 코드 발급 |
| POST | `/api/projects/join?code=` | 초대 코드로 참가 |
| GET/POST | `/api/projects/{id}/kanban/cards` | 칸반 카드 |
| GET/POST | `/api/projects/{id}/schedules` | 일정 |
| GET/POST | `/api/projects/{id}/meetings` | 회의록 |
| GET/POST | `/api/projects/{id}/files` | 파일 |
| GET | `/api/projects/{id}/files/{fileId}/download` | 파일 다운로드 |
| WS | `/ws` | WebSocket 연결 |
| WS | `/app/chat/{projectId}` | 채팅 메시지 전송 |
| WS | `/app/chat/{projectId}/file` | 파일 메시지 전송 |
