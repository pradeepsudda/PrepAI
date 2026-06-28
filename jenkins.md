# Jenkins & SonarQube Integration — Setup Guide

Complete reference for setting up Jenkins CI/CD with SonarQube analysis for the AI Interview System (Spring Boot + Maven project).

---

## Table of Contents

1. [Project Stack](#project-stack)
2. [Files Added](#files-added)
3. [Jenkins Setup](#jenkins-setup)
4. [SonarQube Setup](#sonarqube-setup)
5. [Issues & Fixes Log](#issues--fixes-log)
6. [SonarQube Quality Gate Configuration](#sonarqube-quality-gate-configuration)
7. [Final Pipeline Flow](#final-pipeline-flow)

---

## Project Stack

- Java 21 (Eclipse Adoptium / Temurin)
- Spring Boot 3.5.13
- Maven (via `./mvnw` wrapper)
- JaCoCo (test coverage)
- SonarQube Community Edition
- Jenkins (running in Docker)

---

## Files Added

### `Jenkinsfile` (project root)

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            steps {
                sh '''
                    export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
                    export MAVEN_OPTS="-Dhttps.protocols=TLSv1.2 -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true"
                    chmod +x mvnw
                    ./mvnw clean verify
                '''
            }
            post {
                always {
                    junit testResults: '**/target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
                        export MAVEN_OPTS="-Dhttps.protocols=TLSv1.2 -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true"
                        ./mvnw sonar:sonar -Dsonar.token=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    post {
        success {
            echo 'Build and SonarQube analysis completed successfully!'
        }
        failure {
            echo 'Build failed. Check the logs for details.'
        }
    }
}
```

### `.mvn/jvm.config`

Forces TLS 1.2 for all Maven executions including plugin downloads:

```
-Dhttps.protocols=TLSv1.2
-Djdk.tls.client.protocols=TLSv1.2
-Dmaven.wagon.http.ssl.insecure=true
-Dmaven.wagon.http.ssl.allowall=true
```

### `pom.xml` — SonarQube properties already configured

```xml
<properties>
    <sonar.host.url>http://localhost:9000</sonar.host.url>
    <sonar.projectKey>interview-prep-ai</sonar.projectKey>
    <sonar.projectName>Interview Preparation App</sonar.projectName>
    <sonar.coverage.jacoco.xmlReportPaths>
        target/site/jacoco/jacoco.xml
    </sonar.coverage.jacoco.xmlReportPaths>
</properties>
```

---

## Jenkins Setup

### Required Plugins

Install from **Manage Jenkins → Plugins**:

| Plugin | Purpose |
|--------|---------|
| Pipeline | Jenkinsfile support |
| SonarQube Scanner | `withSonarQubeEnv` step |
| JUnit | Test result publishing |
| Git | Source checkout |

### JDK Configuration

**Manage Jenkins → Global Tool Configuration → JDK**

| Field | Value |
|-------|-------|
| Name | `JDK21` |
| Install automatically | unchecked |
| JAVA_HOME | output of `/usr/libexec/java_home -v 21` (Mac) |

> Note: The Jenkinsfile does NOT use the `tools { jdk }` block — JAVA_HOME is detected dynamically inside each stage with:
> ```sh
> export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
> ```

### SonarQube Server Configuration

**Manage Jenkins → Configure System → SonarQube servers**

| Field | Value |
|-------|-------|
| Environment variables | checked |
| Name | `SonarQube` *(exact — must match Jenkinsfile)* |
| Server URL | `http://<your-mac-ip>:9000` *(not localhost — Jenkins runs in Docker)* |
| Server authentication token | select `sonar-token` credential |

> Get your Mac IP: `ipconfig getifaddr en0`

### Credentials

**Manage Jenkins → Credentials → System → Global credentials → Add Credentials**

| Field | Value |
|-------|-------|
| Kind | `Secret text` |
| ID | `sonar-token` |
| Secret | SonarQube user token (generated in SonarQube) |

### Creating the Pipeline Job

1. **New Item** → name: `AiInterviewSystem` → type: **Pipeline**
2. Under **Pipeline**:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/pradeepsudda/interview-prep-ai`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
3. Click **Save** → **Build Now**

---

## SonarQube Setup

### Start SonarQube via Docker

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:community
```

Open `http://localhost:9000` — default login: `admin` / `admin` (change on first login).

### Generate a Token

1. Avatar (top right) → **My Account → Security**
2. Under **Generate Tokens** → name: `jenkins` → click **Generate**
3. Copy the token (shown only once)
4. Add it to Jenkins as the `sonar-token` credential

### Configure Webhook (required for Quality Gate)

SonarQube must callback Jenkins to report the gate result. Without this, `waitForQualityGate` times out.

1. SonarQube → **Administration → Configuration → Webhooks**
2. Click **Create**

| Field | Value |
|-------|-------|
| Name | `Jenkins` |
| URL | `http://<your-mac-ip>:8080/sonarqube-webhook/` |
| Secret | *(leave blank)* |

3. Click **Create**

### Generate a Token

1. Avatar (top right) → **My Account → Security**
2. Under **Generate Tokens** → name: `jenkins` → click **Generate**
3. Copy the token (shown only once)
4. Add it to Jenkins as the `sonar-token` credential

> If the token becomes invalid, regenerate it here and update the Jenkins credential.

### View Sonar Report

After a successful build, open `http://localhost:9000` → **Projects** → **Interview Preparation App**

---

## Issues & Fixes Log

### Issue 1 — JDK tool name mismatch

```
Tool type "jdk" does not have an install of "JDK21" configured - did you mean "Java"?
```

**Cause:** Jenkins JDK tool was named `Java` but Jenkinsfile used `JDK21`.

**Fix:** Renamed the Jenkins JDK tool to `JDK21` to match the Jenkinsfile.

---

### Issue 2 — `junit` step missing node context

```
org.jenkinsci.plugins.workflow.steps.MissingContextVariableException:
Required context class hudson.Launcher is missing
```

**Cause:** The `junit` step was in the pipeline-level `post` block which runs outside the node context.

**Fix:** Moved `junit` inside the stage-level `post { always { } }` block of the Build & Test stage.

---

### Issue 3 — Maven auto-download SSL failure

```
Failed to install apache-maven-3.9.10-bin.zip
javax.net.ssl.SSLException: (bad_record_mac) Tag mismatch
```

**Cause:** Jenkins was configured to auto-download Maven, and the zip download was corrupted by a TLS issue in the Docker network.

**Fix:** Removed `maven 'Maven'` from the `tools` block. Used `./mvnw` (Maven wrapper already in the project) directly — no download needed.

---

### Issue 4 — JAVA_HOME not set

```
The JAVA_HOME environment variable is not defined correctly,
this environment variable is needed to run this program.
```

**Cause:** Removed the `tools { jdk }` block but didn't set `JAVA_HOME` manually.

**Fix:** Added dynamic JAVA_HOME detection in each stage:

```sh
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
```

---

### Issue 5 — Maven plugin TLS download failure

```
Could not transfer artifact org.codehaus.plexus:plexus-utils:jar:1.5.5
(bad_record_mac) Tag mismatch
```

**Cause:** The sonar-maven-plugin spawns its own HTTP client that doesn't inherit `MAVEN_OPTS`, so TLS 1.2 wasn't being applied to plugin dependency downloads.

**Fix:** Created `.mvn/jvm.config` — this file is read before the JVM starts and applies to all Maven executions including plugin subprocesses:

```
-Dhttps.protocols=TLSv1.2
-Djdk.tls.client.protocols=TLSv1.2
-Dmaven.wagon.http.ssl.insecure=true
-Dmaven.wagon.http.ssl.allowall=true
```

---

### Issue 6 — SonarQube server not found

```
ERROR: SonarQube installation defined in this job (SonarQube)
does not match any configured installation.
```

**Cause:** SonarQube server was not configured in Jenkins, or the name didn't match.

**Fix:** Added SonarQube server in **Manage Jenkins → Configure System → SonarQube servers** with name exactly `SonarQube`.

---

### Issue 7 — SonarQube unreachable (localhost inside Docker)

```
SonarQube server [http://localhost:9000] can not be reached
Connection refused
```

**Cause:** Jenkins runs inside Docker. `localhost` inside the container refers to the container itself, not the host Mac where SonarQube is running.

**Fix:** Changed SonarQube server URL in Jenkins from `http://localhost:9000` to `http://<mac-ip>:9000`.

```bash
# Get Mac IP
ipconfig getifaddr en0
```

---

### Issue 8 — Not authorized / token not passed

```
Not authorized. Please check the properties sonar.login and sonar.password.
```

**Cause:** `withSonarQubeEnv` injects the token as `SONAR_AUTH_TOKEN` env var, but the sonar-maven-plugin doesn't pick it up automatically — it must be passed explicitly.

**Fix:** Pass the token explicitly in the sonar command:

```sh
./mvnw sonar:sonar -Dsonar.token=$SONAR_AUTH_TOKEN
```

Also regenerated the SonarQube token and updated the Jenkins credential to ensure the stored value was valid.

---

### Issue 9 — Quality Gate timeout / ABORTED

```
Cancelling nested steps due to timeout
Timeout has been exceeded
Finished: ABORTED
```

**Cause:** `waitForQualityGate` waits for a webhook callback from SonarQube. No webhook was configured so it waited until the 5-minute timeout and aborted the build.

**Fix:** Configured a SonarQube webhook pointing to Jenkins:
- SonarQube → **Administration → Configuration → Webhooks → Create**
- URL: `http://<mac-ip>:8080/sonarqube-webhook/`

---

### Issue 10 — Code coverage showing 0% in SonarQube

**Cause:** The Jenkinsfile was using `-DskipTests=true` which skips all tests. JaCoCo never ran so no coverage report was generated and SonarQube reported 0%.

**Fix:** Removed `-DskipTests=true` so tests run and JaCoCo generates `jacoco.xml`:

```sh
# Before
./mvnw clean verify -DskipTests=true

# After
./mvnw clean verify
```

Also added Redis auto-configuration exclusions in `src/test/resources/application.yaml` so tests pass without Redis available in Jenkins Docker:

```yaml
spring:
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
      - org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration
```

---

### Issue 11 — Pipeline passes even when coverage is below threshold

**Cause:** Two reasons:
1. Quality Gate stage was commented out in the Jenkinsfile
2. `abortPipeline: false` was set — gate result was checked but build was never failed

**Fix:**
1. Created a custom Quality Gate in SonarQube with coverage threshold:
   - SonarQube → **Quality Gates → Create** → Add Condition: `Coverage < 30` → Save
   - Project → **Project Settings → Quality Gate** → select the custom gate
2. Re-enabled the Quality Gate stage with `abortPipeline: true`:

```groovy
stage('Quality Gate') {
    steps {
        timeout(time: 5, unit: 'MINUTES') {
            waitForQualityGate abortPipeline: true
        }
    }
}
```

---

## SonarQube Quality Gate Configuration

To enforce a minimum coverage threshold so the pipeline fails when coverage is too low:

1. Open SonarQube → **Quality Gates** (top menu)
2. Click **Create** → name: `Interview Prep Gate`
3. Click **Add Condition**:

| Metric | Operator | Value |
|--------|----------|-------|
| Coverage | is less than | `30` |

4. Click **Save**
5. Go to your project → **Project Settings → Quality Gate** → select `Interview Prep Gate`

Now any build with coverage below 30% will be marked **FAILED** in Jenkins.

---

## Final Pipeline Flow

```
Checkout → Build & Test (mvnw clean verify) → SonarQube Analysis → Quality Gate
```

| Stage | Command |
|-------|---------|
| Build & Test | `./mvnw clean verify` (tests enabled, JaCoCo generates coverage) |
| SonarQube Analysis | `./mvnw sonar:sonar -Dsonar.token=$SONAR_AUTH_TOKEN` |
| Quality Gate | `waitForQualityGate abortPipeline: true` (fails build if gate not met) |

**Pipeline fails if:** coverage < 30% (enforced by SonarQube Quality Gate)

SonarQube report: `http://<your-mac-ip>:9000` → Projects → **Interview Preparation App**
