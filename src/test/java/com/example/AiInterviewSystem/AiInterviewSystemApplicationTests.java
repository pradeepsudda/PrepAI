package com.example.AiInterviewSystem;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.connection.RedisConnectionFactory;

@SpringBootTest
class AiInterviewSystemApplicationTests {

	@MockBean
	RedisConnectionFactory redisConnectionFactory;

	@MockBean
	ReactiveRedisConnectionFactory reactiveRedisConnectionFactory;

	@Test
	void contextLoads() {
	}

}
