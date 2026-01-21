import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { friendAPI, userAPI } from "../../services/api";
import Pagination from "../../components/common/Pagination";
import "./FriendManagement.css";

const FriendManagement = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [suggestions, setSuggestions] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");

  // Pagination states
  const [friendsPage, setFriendsPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [suggestionsPage, setSuggestionsPage] = useState(1);
  const itemsPerPage = 2; // Reduced for demo visibility

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setIsLoading(true);
        const res = await friendAPI.getFriends();
        setFriends(res.data.data || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchFriends();
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await friendAPI.getFriendRequests();
        setFriendRequests(res.data.data || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    if (user?.id) {
      fetchRequests();
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (activeTab === "search" && !searchInput) {
        try {
          setIsLoading(true);
          const res = await userAPI.searchUsers("");
          const allUsers = res.data.data?.users || res.data.data || [];

          const filtered = allUsers.filter((u) => {
            const isMe = u.id === user.id;
            const isFriend = friends.some((f) => f.id === u.id);
            const isPending = friendRequests.some(
              (r) => r.requester_id === u.id,
            );

            return !isMe && !isFriend && !isPending;
          });

          setSuggestions(filtered.slice(0, 12));
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSuggestions();
  }, [activeTab, searchInput, user.id, friends, friendRequests]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await userAPI.searchUsers(searchInput);
      const users = res.data.data?.users || res.data.data || [];
      const filtered = users.filter((u) => u.id !== user.id);
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const response = await friendAPI.sendFriendRequest(userId);
      console.log("Response:", response);
      alert("Lời mời kết bạn đã được gửi!");

      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      setSuggestions((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error sending request:", error);
      alert(
        `Lỗi: ${
          error.response?.data?.message || "Lỗi khi gửi lời mời kết bạn!"
        }`,
      );
    }
  };

  const handleAcceptRequest = async (requestId, requesterId) => {
    try {
      await friendAPI.acceptFriendRequest(requesterId);
      setFriendRequests(friendRequests.filter((r) => r.id !== requestId));
      const request = friendRequests.find((r) => r.id === requestId);
      if (request) {
        setFriends([...friends, request]);
      }
      alert("Đã chấp nhận lời mời kết bạn!");
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Lỗi khi chấp nhận lời mời!");
    }
  };

  const handleRejectRequest = async (requestId, requesterId) => {
    try {
      await friendAPI.rejectFriendRequest(requesterId);
      setFriendRequests(friendRequests.filter((r) => r.id !== requestId));
      alert("Đã từ chối lời mời kết bạn!");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Lỗi khi từ chối lời mời!");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm("Bạn có chắc muốn hủy kết bạn?")) {
      return;
    }

    try {
      await friendAPI.removeFriend(friendId);
      setFriends(friends.filter((f) => f.id !== friendId));
      alert("Đã hủy kết bạn!");
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Lỗi khi hủy kết bạn!");
    }
  };

  return (
    <div
      className="friend-management"
      style={{ maxWidth: "900px", margin: "0 auto" }}
    >
      <h1 style={{ marginBottom: "30px" }}>👥 Quản lý kết bạn</h1>

      <div className="tabs" style={{ marginBottom: "30px" }}>
        <button
          className={`tab-btn ${activeTab === "friends" ? "active" : ""}`}
          onClick={() => setActiveTab("friends")}
        >
          👫 Bạn bè ({friends.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          📬 Lời mời ({friendRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          🔍 Tìm kiếm
        </button>
      </div>

      {activeTab === "friends" && (
        <div className="tab-content">
          {friends.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-secondary)",
              }}
            >
              <p>Bạn chưa có bạn bè nào 😢</p>
              <p>Hãy tìm kiếm và gửi lời mời kết bạn!</p>
            </div>
          ) : (
            <>
              <div className="friends-grid">
                {friends
                  .slice((friendsPage - 1) * itemsPerPage, friendsPage * itemsPerPage)
                  .map((friend) => (
                    <div key={friend.id} className="friend-card card">
                      <div className="friend-header">
                        <div className="friend-avatar">
                          {friend.display_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="friend-info">
                          <h3>{friend.display_name}</h3>
                          <p>@{friend.username}</p>
                        </div>
                      </div>
                      {friend.bio && <p className="friend-bio">{friend.bio}</p>}
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveFriend(friend.id)}
                        style={{ width: "100%" }}
                      >
                        Hủy kết bạn
                      </button>
                    </div>
                  ))}
              </div>
              <Pagination
                currentPage={friendsPage}
                totalPages={Math.ceil(friends.length / itemsPerPage)}
                onPageChange={setFriendsPage}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div className="tab-content">
          {friendRequests.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-secondary)",
              }}
            >
              <p>Bạn không có lời mời kết bạn nào 📭</p>
            </div>
          ) : (
            <>
              <div className="requests-list">
                {friendRequests
                  .slice((requestsPage - 1) * itemsPerPage, requestsPage * itemsPerPage)
                  .map((request) => (
                    <div key={request.id} className="request-item card">
                      <div className="request-header">
                        <div className="friend-avatar">
                          {request.display_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="request-info">
                          <h3>{request.display_name}</h3>
                          <p>@{request.username}</p>
                        </div>
                      </div>
                      {request.bio && <p className="friend-bio">{request.bio}</p>}
                      <div className="request-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleAcceptRequest(request.id, request.requester_id)
                          }
                        >
                          ✓ Chấp nhận
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() =>
                            handleRejectRequest(request.id, request.requester_id)
                          }
                        >
                          ✕ Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <Pagination
                currentPage={requestsPage}
                totalPages={Math.ceil(friendRequests.length / itemsPerPage)}
                onPageChange={setRequestsPage}
              />
            </>
          )}
        </div>
      )}

      {activeTab === "search" && (
        <div className="tab-content">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Tìm kiếm theo tên hoặc username..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Đang tìm..." : "🔍 Tìm kiếm"}
            </button>
          </form>

          {!searchInput && (
            <div className="suggestions-section">
              <h3
                style={{
                  margin: "20px 0 15px",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "10px",
                }}
              >
                ✨ Gợi ý kết bạn
              </h3>

              {isLoading && (
                <p style={{ textAlign: "center" }}>Đang tải gợi ý...</p>
              )}

              {!isLoading && suggestions.length === 0 && (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    textAlign: "center",
                  }}
                >
                  Không có gợi ý nào mới.
                </p>
              )}

              {suggestions.length > 0 && (
                <>
                  <div className="friends-grid">
                    {suggestions
                      .slice((suggestionsPage - 1) * itemsPerPage, suggestionsPage * itemsPerPage)
                      .map((suggestion) => (
                        <div key={suggestion.id} className="friend-card card">
                          <div className="friend-header">
                            <div className="friend-avatar">
                              {suggestion.display_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="friend-info">
                              <h3>{suggestion.display_name}</h3>
                              <p>@{suggestion.username}</p>
                            </div>
                          </div>
                          {suggestion.bio && (
                            <p className="friend-bio">{suggestion.bio}</p>
                          )}
                          <button
                            className="btn btn-primary"
                            onClick={() => handleAddFriend(suggestion.id)}
                            style={{ width: "100%" }}
                          >
                            + Kết bạn
                          </button>
                        </div>
                      ))}
                  </div>
                  <Pagination
                    currentPage={suggestionsPage}
                    totalPages={Math.ceil(suggestions.length / itemsPerPage)}
                    onPageChange={setSuggestionsPage}
                  />
                </>
              )}
            </div>
          )}

          {searchResults.length === 0 && searchInput && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-secondary)",
              }}
            >
              <p>Không tìm thấy người dùng nào 😔</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="search-results">
              <h3 style={{ marginBottom: "20px", marginTop: "20px" }}>
                Kết quả tìm kiếm ({searchResults.length})
              </h3>
              <div className="friends-grid">
                {searchResults
                  .slice((searchPage - 1) * itemsPerPage, searchPage * itemsPerPage)
                  .map((result) => {
                    const isFriend = friends.some((f) => f.id === result.id);
                    return (
                      <div key={result.id} className="friend-card card">
                        <div className="friend-header">
                          <div className="friend-avatar">
                            {result.display_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="friend-info">
                            <h3>{result.display_name}</h3>
                            <p>@{result.username}</p>
                          </div>
                        </div>
                        {result.bio && <p className="friend-bio">{result.bio}</p>}
                        {isFriend ? (
                          <div
                            style={{
                              width: "100%",
                              textAlign: "center",
                              padding: "10px",
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: "#10b981",
                              backgroundColor: "rgba(16, 185, 129, 0.1)",
                              borderRadius: "6px",
                            }}
                          >
                            ✓ Bạn bè
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleAddFriend(result.id)}
                            style={{ width: "100%" }}
                          >
                            + Gửi lời mời
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
              <Pagination
                currentPage={searchPage}
                totalPages={Math.ceil(searchResults.length / itemsPerPage)}
                onPageChange={setSearchPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendManagement;
