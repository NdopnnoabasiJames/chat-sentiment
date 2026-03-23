# Test Conversations

## 1. Frustrated Customer (Negative)
{
  "agentId": "agent_1",
  "conversationId": "conv_001",
  "messages": [
    { "role": "customer", "text": "I paid but I can't access my account" },
    { "role": "agent", "text": "Please hold on" },
    { "role": "customer", "text": "I've been waiting for 30 minutes" },
    { "role": "agent", "text": "Still checking" },
    { "role": "customer", "text": "This is really frustrating" }
  ]
}

## 2. Positive Resolution
{
  "agentId": "agent_2",
  "conversationId": "conv_002",
  "messages": [
    { "role": "customer", "text": "I can't login" },
    { "role": "agent", "text": "Reset your password using this link" },
    { "role": "customer", "text": "Okay it worked" },
    { "role": "agent", "text": "Glad to hear that" },
    { "role": "customer", "text": "Thanks a lot" }
  ]
}

## 3. Neutral Conversation
{
  "agentId": "agent_3",
  "conversationId": "conv_003",
  "messages": [
    { "role": "customer", "text": "Can I change my plan?" },
    { "role": "agent", "text": "Yes, from your dashboard" },
    { "role": "customer", "text": "Alright" }
  ]
}

## 4. Poor Agent Performance
{
  "agentId": "agent_1",
  "conversationId": "conv_004",
  "messages": [
    { "role": "customer", "text": "My subscription is not active" },
    { "role": "agent", "text": "Wait" },
    { "role": "customer", "text": "It's been 20 minutes" },
    { "role": "agent", "text": "Still checking" },
    { "role": "customer", "text": "This is bad service" }
  ]
}

## 5. Mixed Sentiment (Resolved Late)
{
  "agentId": "agent_2",
  "conversationId": "conv_005",
  "messages": [
    { "role": "customer", "text": "My payment failed twice" },
    { "role": "agent", "text": "Please try again" },
    { "role": "customer", "text": "This is annoying" },
    { "role": "agent", "text": "Try a different card" },
    { "role": "customer", "text": "Okay it worked now" }
  ]
}

## 6. Highly Positive
{
  "agentId": "agent_4",
  "conversationId": "conv_006",
  "messages": [
    { "role": "customer", "text": "Everything is working perfectly" },
    { "role": "agent", "text": "Glad to hear that" },
    { "role": "customer", "text": "Your service is amazing" }
  ]
}

## 7. Confused Customer
{
  "agentId": "agent_5",
  "conversationId": "conv_007",
  "messages": [
    { "role": "customer", "text": "I don't understand how to use this" },
    { "role": "agent", "text": "Check the guide" },
    { "role": "customer", "text": "Still confused" }
  ]
}

## 8. Angry Customer
{
  "agentId": "agent_3",
  "conversationId": "conv_008",
  "messages": [
    { "role": "customer", "text": "This app is useless" },
    { "role": "agent", "text": "Sorry for the inconvenience" },
    { "role": "customer", "text": "I want a refund now" }
  ]
}

## 9. Short Positive
{
  "agentId": "agent_2",
  "conversationId": "conv_009",
  "messages": [
    { "role": "customer", "text": "Thanks" },
    { "role": "agent", "text": "You're welcome" }
  ]
}

## 10. Escalating Frustration
{
  "agentId": "agent_1",
  "conversationId": "conv_010",
  "messages": [
    { "role": "customer", "text": "My stream keeps stopping" },
    { "role": "agent", "text": "Restart your app" },
    { "role": "customer", "text": "I already did that" },
    { "role": "agent", "text": "Check your internet" },
    { "role": "customer", "text": "Everything else works, this is annoying" }
  ]
}
