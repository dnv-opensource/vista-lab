using Common;
using Common.Models;
using Moq;
using VistaLab.QueryApi.Controllers;
using VistaLab.QueryApi.Models;
using VistaLab.QueryApi.Repository;

namespace VistaLab.QueryApi.Unit.Test.Controllers
{
    public class RepositoryTest
    {
        // TODO Migrate to integrated test
        [Fact(Skip = "Must be migrated to integration test")]
        public void Get_Filter_ReturnData()
        {
            //var client = new QuestDBClient("http://127.0.0.1");
            var client = new DbClient(new HttpClient());

            /*
            1036.11/S90.3/S61       1036.13i-3/C662.1/C661
            */
            var input = new DataChannelFilter()
            {
                PrimaryItem = new[] { "1036*61" },
                SecondaryItem = new[] { "1036*C6" }
            };

            var sql =
                "SELECT LocalId, PrimaryItem, SecondaryItem, Meta "
                + "FROM DataChannel "
                + "WHERE ";

            var primaryItemWhere = string.Empty;
            var secondaryItemWhere = string.Empty;

            if (input.PrimaryItem != null && input.PrimaryItem.Any())
                primaryItemWhere += string.Join(
                    " OR ",
                    input.PrimaryItem.Select(
                        x =>
                            $" PrimaryItem LIKE \'%{x.Replace("/", string.Empty).Replace('*', '%')}%\' "
                    )
                );

            if (input.SecondaryItem != null && input.SecondaryItem.Any())
                secondaryItemWhere += string.Join(
                    " OR ",
                    input.SecondaryItem.Select(
                        x =>
                            $" SecondaryItem LIKE \'%{x.Replace("/", string.Empty).Replace('*', '%')}%\' "
                    )
                );

            sql = sql + string.Join(" OR ", primaryItemWhere, secondaryItemWhere);

            //var queryApi = client.GetQueryApi();
            //var dataModel = queryApi.QueryEnumerable<DataChannelResult>(sql);
        }

        [Fact]
        public async Task Get_WithFilter_CallsRepository()
        {
            //Arrange
            var mockRepository = new Mock<IDataChannelRepository>();
            var controller = new DataChannelController(mockRepository.Object);
            var filter = new DataChannelFilter();

            mockRepository
                .Setup(x => x.Get(It.IsAny<DataChannelFilter>()))
                .ReturnsAsync(new List<DataChannelDto>());

            //Act
            await controller.Post(filter);

            //Assert
            mockRepository.Verify(x => x.Get(It.IsAny<DataChannelFilter>()), Times.Once);
        }
    }
}
