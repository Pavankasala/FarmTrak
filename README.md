# \u{1F33E} FarmTrak - Poultry Farm Management

FarmTrak is a comprehensive web application designed to help poultry farmers manage their operations efficiently. It provides a centralized platform for tracking flocks, recording financial data, monitoring egg production, and analyzing key farm metrics to optimize performance.

---

## \u{1F680} Live Features

* \u{1F510} **Secure Authentication**: Users can securely sign in or sign up using email verification (OTP) or Google Single Sign-On (SSO).
* \u{1F4CA} **Data-rich Dashboard**: A central hub provides a visual overview of key metrics such as total birds, daily egg production, and profit/loss.
* \u{1F986} **Flock Management**: Easily add, edit, and delete flock records, including species, size, age, and start date.
* \u{1F95A} **Egg Production Tracker**: Record daily egg counts for specific flocks to monitor production trends over time.
* \u{1F4B3} **Financial Tracking**: Log and categorize all farm expenses (e.g., feed, medicine) and revenue (e.g., egg sales, flock sales).
* \u{1F4E6} **Feed Calculator**: An interactive tool to calculate and predict a flock's daily feed consumption per bird based on a given duration.
* \u{1F304} **Responsive UI & Dark Mode**: The modern interface adapts seamlessly to different screen sizes and includes a user-friendly dark mode.

---

## \u{1F4BB} Tech Stack

* **Backend**: `Java` with `Spring Boot`
* **Database**: `PostgreSQL`
* **Frontend**: `React` with `Vite`
* **Styling**: `Tailwind CSS` with `Framer Motion` for animations
* **Charting**: `Recharts` for data visualization
* **Deployment**: `Render` for the backend API and `GitHub Pages` for the frontend

---

## \u{1F6E0}\ufe0f Setup

### Prerequisites
-   Java Development Kit (JDK) 17+
-   Maven 3.6+
-   Node.js 14+ and npm
-   A PostgreSQL database
-   Google Cloud project for OAuth credentials
-   Email service (e.g., Gmail with an app password)

### 1. Backend

1.  **Clone the repository**:
    ```sh
    git clone [https://github.com/Pavankasala/FarmTrak.git](https://github.com/Pavankasala/FarmTrak.git)
    cd FarmTrak/Backend
    ```

2.  **Configure environment variables**:
    The backend uses environment variables for database and email service configuration, as defined in `Backend/src/main/resources/application.properties`.
    ```properties
    spring.datasource.url=${JDBC_DATABASE_URL}
    spring.datasource.username=${JDBC_DATABASE_USERNAME}
    spring.datasource.password=${JDBC_DATABASE_PASSWORD}
    spring.mail.username=${MAIL_USERNAME}
    spring.mail.password=${MAIL_APP_PASSWORD}
    ```

3.  **Build and run**:
    ```sh
    ./mvnw clean install -DskipTests
    java -jar target/*.jar
    ```

### 2. Frontend

1.  **Navigate to the frontend directory**:
    ```sh
    cd ../Frontend
    ```

2.  **Install dependencies**:
    ```sh
    npm install
    ```

3.  **Run in development mode**:
    ```sh
    npm run dev
    ```

---

## \u{1F4C1} File Structure
