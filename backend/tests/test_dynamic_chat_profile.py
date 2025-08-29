from __future__ import annotations


async def test_user_session_chat_profile_emits_event(
    mock_chainlit_context, test_config
):
    """Ensure setting chat_profile in user_session emits websocket event and syncs session."""
    from chainlit import user_session

    async with mock_chainlit_context as ctx:
        # Precondition
        assert ctx.session.chat_profile is None

        # Act
        user_session.set("chat_profile", "DynamicAgent")

        # Assert session updated
        assert ctx.session.chat_profile == "DynamicAgent"

        # Assert emit called with expected event & payload.
        # emit() is invoked and its coroutine scheduled via create_task, not awaited directly.
        ctx.session.emit.assert_any_call("chat_profile_changed", "DynamicAgent")

        # Idempotency: setting same value should still update but may emit again; no strict check.
        user_session.set("chat_profile", "DynamicAgent")
